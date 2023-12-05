import { Accessor, onCleanup, onMount, untrack } from "solid-js";
import { Validation } from "../validate";
import { createControl } from "./control";

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
  //   control<E extends HTMLElement>(el: E, accessor?: () => true): void;
}

export class Field<K extends keyof T, T> {
  #channel: Channel<K, T>;
  #validations: Validation[];
  #name: K;
  #validationEvent?: "input" | "blur";

  #hooks: ((value?: T[K]) => Promise<boolean> | boolean)[] = [];

  constructor(
    name: K,
    channel: Channel<K, T>,
    validators: Validation[],
    validationEvent?: "input" | "blur"
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
    let ok = 0;
    for (const hook of this.#hooks) {
      ok |= (await Promise.resolve(
        hook(this.#channel.value())
      )) as unknown as number;
    }

    return !!ok;
  }

  async validate() {
    const errors = await Promise.all(
      this.#validations.map(async (m) => {
        if (await Promise.resolve(m.validate(this.#channel.value()))) {
          return null;
        } else {
          return typeof m.message === "function"
            ? m.message(this.#name as string)
            : m.message;
        }
      })
    );

    this.#channel.setErrors(errors.filter(Boolean) as string[]);
  }

  api(): FieldApi<T[K]> {
    return {
      [$FieldProperty]: this as any,
      value: this.#channel.value,
      setValue: (value) => {
        const event = this.#validationEvent;

        if (event == "input") {
          const oldValue = untrack(this.#channel.value);
          if (oldValue == value) {
            return;
          }
        }
        this.#channel.setValue(value);
        if (event === "input") {
          this.validate();
        }
      },
      touch: () => {
        if (this.#validationEvent === "blur") {
          this.validate();
        }
      },
      errors: this.#channel.errors,
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
