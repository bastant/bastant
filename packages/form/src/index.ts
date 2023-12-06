export type { Validation } from "./validations.js";
export * from "./validations.js";
export * from "./list-state.js";
export type { Op, ListEntry, ListModel, ListState } from "./list-state.js";
export * from "./form-state.jsx";

export { type FieldApi, useSubmitHook } from "./field.js";
export {
  createForm,
  type FormApi,
  type FormOptions,
  type ValidationEvent,
} from "./form.js";

import type { Validation } from "./validations.js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      validate: Validation;
      control: true | "input" | "change";
    }
  }
}
