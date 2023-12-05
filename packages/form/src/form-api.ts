import { createStore, unwrap } from "solid-js/store";
import { Validation } from "./validate.js";
import { type Accessor, createComputed, batch, untrack } from "solid-js";
import { FieldApi, createControl, createField, validate } from "./field.jsx";
import { toError } from "./util.js";
import { ValueOf } from "type-fest";

function callOrReturn<T>(value: T | (() => T)): T {
  return typeof value === "function" ? (value as any)() : value;
}

export interface FormApi<T> {
  field<K extends keyof T>(name: K): FieldApi<T[K]>;
  submit: (e?: Event) => void;
  control<E extends HTMLElement>(el: E, accessor?: () => true): void;
  readonly values: Accessor<Partial<T>>;
  reset: (e?: Event) => void;
  clear: () => void;
  validate: () => Promise<boolean>;

  isSubmitting: () => boolean;
  isValidating: () => boolean;
  isDirty: () => boolean;
  isValid: () => boolean;
  status: () => Status;
  clearErrors(): void;
  submitError: () => Error | undefined;
}

export interface FormOptions<T> {
  defaultValues?: T | Accessor<T | undefined>;
  submit?: (value: T) => Promise<void> | void;
  validations?: Partial<Record<keyof T, Validation[]>>;
  submitOnError?: Accessor<boolean> | boolean;
  validateOnInitial?: Accessor<boolean> | boolean;
  validateEvent?:
    | Accessor<"input" | "change" | "submit">
    | "input"
    | "change"
    | "submit";
}

interface FormStore<T> {
  validationErrors: Partial<Record<keyof T, string[]>>;
  submitError: Error | undefined;
  values: Partial<T>;
  status: Status;
  dirty: boolean;
  fields: Partial<Record<keyof T, ValueOf<T>>>;
}

export type Status = "editing" | "submitting" | "validating" | "failed";

export function createFormApi<T>(options: FormOptions<T> = {}): FormApi<T> {
  const [state, setState] = createStore<FormStore<T>>({
    validationErrors: {},
    values: {},
    submitError: void 0,
    status: "editing",
    dirty: false,
    fields: {},
  });

  const hasErrors = () =>
    Object.values(state.validationErrors).some((m) => (m as string[])?.length);

  const reset = () => {
    batch(() => {
      setState(
        "values",
        (typeof options.defaultValues == "function"
          ? (options.defaultValues as any)()
          : options.defaultValues) ?? {}
      );
      setState("dirty", false);
      setState("submitError", void 0);
      setState("validationErrors", {});
    });
  };

  const setValue = <K extends keyof T>(key: K, value: T[K] | undefined) => {
    batch(() => {
      setState("values", key as any, value as any);
      setState("dirty", true);

      const vEvent = callOrReturn(options.validateEvent);

      if (vEvent == "change" || vEvent == "submit") {
        setState("validationErrors", key as any, [] as any);
      }
    });
  };

  function field<K extends keyof T>(name: K): FieldApi<T[K]> {
    const found = untrack(() => state.fields)[name];
    if (found) return found as unknown as FieldApi<T[K]>;

    const field = createField({
      validationEvent: () => callOrReturn(options.validateEvent) ?? "submit",
      value: () => state.values[name],
      setValue(value) {
        setValue(name, value);
      },
      async validate() {
        await validateField(name);
      },
      errors() {
        return state.validationErrors[name];
      },
    }) as FieldApi<T[K]>;

    setState("fields", (fields) => ({ ...fields, [name]: field }));

    return field;
  }

  createComputed(reset);

  const control = function <E extends HTMLElement>(el: E) {
    const name = el.getAttribute("name") as keyof T;
    if (!name) {
      console.error("no name");
      return;
    }

    const ctrl = field(name);
    createControl(ctrl.value, ctrl.setValue, ctrl.touch)(el, () => true);
  };

  const validateField = async (name: keyof T, single = true) => {
    if (single) {
      setState("status", "validating");
    }

    const validators = options.validations?.[name] ?? [];
    const errors = await validate(
      name as string,
      validators,
      state.values[name]
    );
    batch(() => {
      setState("validationErrors", name as any, errors as any);
      if (single) {
        setState("status", "editing");
      }
    });
  };

  async function validateFn() {
    setState("status", "validating");
    const promises: Promise<void>[] = [];
    for (const field in options.validations) {
      promises.push(validateField(field, false));
    }

    try {
      await Promise.all(promises);
    } catch {}

    setState("status", "editing");

    return !hasErrors();
  }

  return {
    status: () => state.status,
    isValidating() {
      return state.status == "validating";
    },
    isSubmitting() {
      return state.status == "submitting";
    },
    isDirty() {
      return state.dirty;
    },
    isValid() {
      return hasErrors();
    },
    submitError() {
      return state.submitError;
    },
    field,
    async submit(e) {
      e?.preventDefault();

      if (!callOrReturn(options.submitOnError ?? true)) {
        const valid = await validateFn();
        if (!valid) {
          return;
        }
      }

      setState("status", "submitting");
      try {
        await options.submit?.(unwrap(state.values) as T);
        batch(() => {
          setState("status", "editing");
          setState("dirty", false);
        });
      } catch (e) {
        batch(() => {
          setState("status", "failed");
          setState("submitError", toError(e));
        });
      }
    },
    validate: validateFn,
    control,
    reset,
    values: () => ({ ...state.values }),
    clear: () =>
      setState({
        values: {},
        validationErrors: {},
        submitError: void 0,
        status: "editing",
      }),
    clearErrors: () => {
      setState((old) => ({
        ...old,
        validationErrors: {},
        submitError: void 0,
        status: "editing",
      }));
    },
  };
}
