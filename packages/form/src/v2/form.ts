import { Accessor, batch, createComputed, untrack } from "solid-js";
import { Validation } from "../validate.js";
import { SetStoreFunction, createStore } from "solid-js/store";
import { Field, FieldApi } from "./field.js";
import { toError } from "../util.js";
import { createControl } from "./control.js";

export type Status = "editing" | "submitting" | "validating" | "failed";

export type ValidationEvent = "input" | "blur" | "submit";

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
  validations?:
    | Partial<Record<keyof T, Validation[]>>
    | Accessor<Partial<Record<keyof T, Validation[]>>>;
  validationEvent?: ValidationEvent | Accessor<ValidationEvent>;
  submit?: (value: T) => Promise<void> | void;
  submitOnError?: boolean | Accessor<boolean>;
}

export interface FormApi<T> {
  field<K extends keyof T>(name: K): FieldApi<T[K]>;
  values: Accessor<Partial<T>>;
  submit(e?: Event): void;
  clear(): void;
  reset(): void;
  validate(): Promise<boolean>;
  control<E extends HTMLElement>(el: E, accessor?: () => true): void;

  isSubmitting: Accessor<boolean>;
  isDirty: Accessor<boolean>;
  isValid: Accessor<boolean>;
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
      values: callOrReturn(options.defaultValues) ?? {},
      dirty: false,
      validationErrors: {},
      submitError: void 0,
      status: "editing",
    }));
  };

  createComputed(reset);

  const isValid = () => {
    return !state.submitError && !Object.keys(state.validationErrors).length;
  };

  const validate = async () => {
    for (const name in state.fields) {
      await state.fields[name]?.validate();
    }

    return !!Object.keys(state.validationErrors).length;
  };

  return {
    isSubmitting() {
      return state.status === "submitting";
    },
    isDirty() {
      return state.dirty;
    },
    isValid,
    submitError() {
      return state.submitError;
    },
    clearErrors() {
      setState((old) => ({
        ...old,
        validationErrors: {},
        submitError: void 0,
        status: "editing",
      }));
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
    validate,
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
        options.validations,
        options.validationEvent as any
      ).api();

      createControl(ctrl.value, ctrl.setValue, ctrl.touch)(el, () => true);
    },
    async submit(e?: Event) {
      e?.preventDefault();

      if (callOrReturn(options.validationEvent) == "submit") {
        await validate();
      }

      if (!callOrReturn(options.submitOnError) && !isValid()) {
        return;
      }

      const con = (
        await Promise.all(
          Object.values(state.fields).map((m: any) => m.beforeSubmit())
        )
      ).reduce((p, c) => {
        return p | c;
      }, 0);

      if (!con) return;

      setState("status", "submitting");
      try {
        await Promise.resolve(options.submit?.(state.values as T));
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
  validations?:
    | Partial<Record<keyof T, Validation[]>>
    | Accessor<Partial<Record<keyof T, Validation[]>>>,
  validationEvent?: ValidationEvent | Accessor<ValidationEvent | undefined>
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
          const vEvent = callOrReturn(validationEvent);

          if (vEvent == "submit") {
            setState("validationErrors", name as any, [] as any);
          }
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
    () =>
      (callOrReturn(validations) ??
        ({} as Partial<Record<keyof T, Validation[]>>))[name] ?? [],
    () => callOrReturn(validationEvent) as "input" | "blur" | undefined
  );

  setState("fields", name as any, field as any);

  return field;
}
