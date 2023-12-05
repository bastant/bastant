import { Accessor, batch, createComputed, onMount, untrack } from "solid-js";
import { Validation } from "../validate.js";
import { SetStoreFunction, createStore } from "solid-js/store";
import { Field, FieldApi } from "./field.jsx";
import { toError } from "../util.js";
import { createControl } from "./control.jsx";

export type Status = "editing" | "submitting" | "validating" | "failed";

interface FormState<T> {
  values: Partial<T>;
  status: Status;
  dirty: boolean;
  fields: Partial<Record<keyof T, Field<keyof T, T>>>;
  validationErrors: Partial<Record<keyof T, string[]>>;
  submitError?: Error | undefined;
}

export interface FormOptions<T> {
  defaultValues?: T | Accessor<T | undefined>;
  validations?: Partial<Record<keyof T, Validation[]>>;
  validationEvent?: "input" | "blur" | "submit";
  submit?: (value: T) => Promise<void>;
}

export interface FormApi<T> {
  field<K extends keyof T>(name: K): FieldApi<T[K]>;
  values(): Partial<T>;
  submit(e?: Event): void;
  clear(): void;
  reset(): void;
  validate(): Promise<boolean>;
  control<E extends HTMLElement>(el: E, accessor?: () => true): void;

  isSubmitting: Accessor<boolean>;
  isDirty: Accessor<boolean>;
  clearErrors(): void;
  submitError: () => Error | undefined;
}

function callOrReturn<T>(value: T | (() => T)): T {
  return typeof value === "function" ? untrack(value as () => T) : value;
}

export function createForm<T>(options: FormOptions<T>): FormApi<T> {
  const [state, setState] = createStore<FormState<T>>({
    values: {},
    status: "editing",
    dirty: false,
    fields: {},
    validationErrors: {},
    submitError: void 0,
  });

  const reset = () => {
    setState((state) => ({
      ...state,
      values: callOrReturn(options.defaultValues),
      dirty: false,
      validationErrors: {},
      submitError: void 0,
      status: "editing",
    }));
  };

  createComputed(reset);

  return {
    isSubmitting() {
      return state.status === "submitting";
    },
    isDirty() {
      return state.dirty;
    },
    submitError() {
      return state.submitError;
    },
    clearErrors() {
      batch(() => {
        setState("submitError", void 0);
        setState("validationErrors", {});
      });
    },
    field<K extends keyof T>(name: K) {
      const field = createField(
        name,
        state,
        setState,
        options.validations ?? {},
        options.validationEvent as any
      );

      return field.api() as FieldApi<T[K]>;
    },
    values() {
      return { ...state.values };
    },
    clear() {
      setState((state) => ({
        ...state,
        values: {},
        dirty: false,
        validationErrors: {},
        submitError: void 0,
        status: "editing",
      }));
    },
    reset,
    async validate() {
      for (const name in state.fields) {
        await state.fields[name]?.validate();
      }

      return !!Object.keys(state.validationErrors).length;
    },
    control<E extends HTMLElement>(el: E) {
      const name = el.getAttribute("name") as keyof T;
      if (!name) {
        console.error("no name");
        return;
      }

      const ctrl = createField(
        name,
        state,
        setState,
        options.validations ?? {},
        options.validationEvent as any
      ).api();

      createControl(ctrl.value, ctrl.setValue, ctrl.touch)(el, () => true);
    },
    async submit(e?: Event) {
      e?.preventDefault();

      if (options.validationEvent == "submit") {
        if (!(await this.validate())) {
          return;
        }
      }

      const con = (
        await Promise.all(
          Object.values(state.fields).map((m: any) => m.beforeSubmit())
        )
      ).reduce((p, c) => {
        p | c;
      }, 0);

      if (!con) return;

      setState("status", "submitting");
      try {
        await Promise.resolve(options.submit?.(untrack(this.values) as T));
        batch(() => {
          setState("status", "editing");
          setState("dirty", false);
        });
      } catch (e) {
        setState("status", "failed");
        setState("submitError", toError(e));
      }
    },
  };
}

function createField<K extends keyof T, T>(
  name: K,
  state: FormState<T>,
  setState: SetStoreFunction<FormState<T>>,
  validations: Partial<Record<keyof T, Validation[]>>,
  validationEvent?: "input" | "blur"
) {
  const found = state.fields[name];
  if (found) return found;

  const field = new Field<K, T>(
    name,
    {
      setValue(value) {
        batch(() => {
          setState("dirty", true);
          setState("values", name as any, value as any);
        });
      },
      value() {
        return state.values[name] as T[K] | undefined;
      },
      errors() {
        return state.validationErrors[name];
      },
      setErrors(errors) {
        setState("validationErrors", name as any, errors as any);
      },
    },
    validations[name] ?? [],
    validationEvent
  );

  setState("fields", name as any, field as any);

  return field;
}
