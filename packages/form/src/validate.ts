import { createEffect, onCleanup } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { getValue } from "./util";

export interface Validation {
  name: string;
  message: string | ((name: string) => string);
  init?: (el: HTMLElement) => void;
  validate(value: unknown): Promise<boolean> | boolean;
}

export interface ValidationOptions {
  event: "change" | "input";
  errors: (name: string, validation: string, error: string | undefined) => void;
  validations: (name: string, validation: () => void) => void;
  initial?: boolean;
}

export function createValidation(options: ValidationOptions) {
  return function <T extends HTMLElement>(el: T, accessor: () => Validation) {
    const name = el.getAttribute("name");

    if (!name) {
      console.warn("form element does not have a name");
      return;
    }

    accessor()?.init?.(el);

    const validate = () => {
      const validation = accessor();

      const value = getValue(el);

      Promise.resolve(validation.validate(value)).then((ret) => {
        if (!ret) {
          options.errors(
            name,
            validation.name,
            typeof validation.message == "function"
              ? validation.message(name)
              : validation.message
          );
        } else {
          options.errors(name, validation.name, void 0);
        }
      });
    };

    createEffect(() => {
      options.validations(name, validate);
    });

    el.addEventListener(options.event, validate);

    // initial validation
    if (options.initial) validate();

    onCleanup(() => {
      el.removeEventListener(options.event, validate);
      options.validations(name, validate);
    });
  };
}
