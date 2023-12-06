import {
  Accessor,
  createComputed,
  createSignal,
  on,
  onCleanup,
} from "solid-js";
import { getValue, setValue as setElValue } from "./util.js";
import { Validation } from "./validate.js";

export type ValidationEvent = "change" | "input" | "submit";

export interface FieldApi<T> {
  value: Accessor<T | undefined>;
  setValue: (value: T | undefined) => void;
  /**
   * A control directive
   * @param el HTMLElement
   * @param accessor Accessor<true | "input" | "change">
   * @returns
   */
  control: <E extends HTMLElement>(
    el: E,
    accessor?: Accessor<true | "input" | "change">
  ) => void;
  /**
   * Validate value
   *
   */
  validate: () => Promise<void>;
  /**
   * Current errors
   * @returns string[] | undefined
   */
  errors: () => string[] | undefined;
  /**
   * Touch
   */
  touch: () => void;
}

export interface CreateFieldOptions<T> {
  name?: string;
  value?: Accessor<T | undefined>;
  validators?: Validation[];
  validateEvent?: Accessor<ValidationEvent>;
  event?: "input" | "change";
}

export function createFieldApi<T>(
  options: CreateFieldOptions<T> = {}
): FieldApi<T> {
  const [value, setValue] = createSignal<T | undefined>(options.value?.());
  const [errors, setErrors] = createSignal<string[]>([]);

  createComputed(
    on(
      options.value ?? ((() => {}) as Accessor<T | undefined>),
      (v: T | undefined) => {
        setValue(() => v);
      }
    )
  );

  return createField({
    validationEvent: options.validateEvent ?? (() => "submit"),
    setValue: (v) => {
      setValue(() => v);
    },
    value,
    errors() {
      const v = errors();
      return v.length ? v : void 0;
    },
    async validate() {
      setErrors(
        await validate(options.name, options.validators ?? [], value())
      );
    },
  });
}

export async function validate<T>(
  name: string | undefined,
  validators: Validation[],
  value: T
): Promise<string[]> {
  const errors: string[] = [];
  for (const validation of validators) {
    const valid = await Promise.resolve(validation.validate(value));
    if (!valid) {
      const msg =
        typeof validation.message == "function"
          ? validation.message(name ?? "")
          : validation.message;
      errors.push(msg);
    }
  }
  return errors;
}

export function createControl<T>(
  value: Accessor<T | undefined>,
  setValue: (value: T | undefined) => void,
  touch: () => void
) {
  return function <E extends HTMLElement>(
    el: E,
    p?: Accessor<true | "input" | "change">
  ) {
    const input = function (e: Event) {
      // if (e.currentTarget instanceof HTMLInputElement) {
      //   setValue(getValue(el) as unknown as T);
      // }
      setValue(getValue(el) as unknown as T);
    };

    const blur = function (e: Event) {
      touch();
    };

    createComputed(() => {
      const v = value() ?? "";
      setElValue(el, v);
    });

    const event = (p?.() === true ? "input" : (p?.() as string)) ?? "input";

    el.addEventListener(event, input);
    el.addEventListener("blur", blur);

    onCleanup(() => {
      el.removeEventListener(event, input);
      el.removeEventListener("blur", blur);
    });
  };
}

export interface Options<T> {
  value: () => T | undefined;
  setValue: (value: T | undefined) => void;
  errors: () => string[] | undefined;
  validate: () => Promise<void>;
  validationEvent: Accessor<ValidationEvent>;
}

export function createField<T>(options: Options<T>): FieldApi<T> {
  function setValue(val: T | undefined) {
    if (options.validationEvent() == "input") {
      const oldValue = options.value();
      if (oldValue == val) {
        return;
      }
    }

    options.setValue(val);

    if (options.validationEvent() == "input") {
      options.validate();
    }
  }

  function touch() {
    if (options.validationEvent() == "change") {
      options.validate();
    }
  }

  return {
    control: createControl(options.value, setValue, touch),
    value: options.value,
    setValue,
    touch,
    errors: options.errors,
    validate: options.validate,
  };
}
