import { Accessor, batch, onCleanup, onMount, untrack } from "solid-js";
import type { Validation } from "./validations.js";
import { createControl } from "./control.js";

const $FieldProperty = Symbol("$FieldProperty");

export interface Channel<K extends keyof T, T> {
  value: () => T[K] | undefined;
  setValue: (value: T[K] | undefined) => void;
  errors: () => string[] | undefined;
  setErrors: (errors: string[]) => void;
}

export interface FieldApi<T> {
  [$FieldProperty]: Field<keyof T, T>;
  value: Accessor<T | undefined>;
  setValue(value?: T): void;
  touch(): void;
  errors(): string[] | undefined;
  control<E extends HTMLElement>(el: E, accessor?: () => true): void;
  validate(): Promise<boolean>;
}

export class Field<K extends keyof T, T> {
  #channel: Channel<K, T>;
  #validations: Accessor<Validation[]>;
  #name: K;
  #validationEvent: Accessor<"input" | "blur" | undefined>;
  #hooks: ((value?: T[K]) => Promise<boolean> | boolean)[] = [];

  constructor(
    name: K,
    channel: Channel<K, T>,
    validators: Accessor<Validation[]>,
    validationEvent: Accessor<"input" | "blur" | undefined>
  ) {
    this.#channel = channel;
    this.#validations = validators;
    this.#name = name;
    this.#validationEvent = validationEvent;
  }

  onSubmit(hook: (value?: T[K]) => Promise<boolean> | boolean): () => void {
    this.#hooks.push(hook);
    return () => {
      this.#hooks = this.#hooks.filter((m) => m != hook);
    };
  }

  async beforeSubmit(): Promise<boolean> {
    if (this.#hooks.length == 0) {
      return true;
    }

    const value = untrack(this.#channel.value);

    let ok = 0;
    for (const hook of this.#hooks) {
      ok |= (await Promise.resolve(hook(value))) as unknown as number;
    }

    return !!ok;
  }

  async validate() {
    const value = untrack(this.#channel.value);

    const result = await Promise.all(
      this.#validations().map(async (m) => {
        if (await Promise.resolve(m.validate(value))) {
          return null;
        } else {
          return typeof m.message === "function"
            ? m.message(this.#name as string)
            : m.message;
        }
      })
    );

    const errors = result.filter(Boolean) as string[];

    this.#channel.setErrors(errors);

    return !!errors.length;
  }

  api(): FieldApi<T[K]> {
    const setValue = (value: T[K] | undefined) => {
      const event = this.#validationEvent();

      if (event == "input") {
        const oldValue = untrack(this.#channel.value);
        if (oldValue == value) {
          return;
        }
      }
      batch(() => {
        this.#channel.setValue(value);
        if (event === "input") {
          this.validate();
        }
      });
    };

    const touch = () => {
      const event = this.#validationEvent();
      if (event === "blur") {
        this.validate();
      }
    };

    return {
      [$FieldProperty]: this as any,
      value: this.#channel.value,
      setValue,
      control: createControl(this.#channel.value, setValue, touch),
      touch,
      errors: this.#channel.errors,
      validate: () => this.validate(),
    };
  }
}

export function useSubmitHook<T>(
  api: FieldApi<T>,
  hook: (value?: T) => boolean | Promise<boolean>
) {
  const field = api[$FieldProperty];
  onMount(() => {
    const close = field.onSubmit(hook as any);
    onCleanup(close);
  });
}
