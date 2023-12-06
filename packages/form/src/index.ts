export type { Validation } from "./validate.js";
export { createForm } from "./create-form.jsx";
export { createFieldApi as createField } from "./field.jsx";
export * from "./form-api.js";
export * from "./validations.js";
export * from "./list-state.js";

export type { FieldApi, ValidationEvent } from "./field.jsx";
export type { FormApi, FormOptions } from "./form-api.js";
export type { Op, ListEntry, ListModel, ListState } from "./list-state.js";

export * from "./form-state.jsx";

import type { Validation } from "./validate.js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      validate: Validation;
      control: true | "input" | "change";
    }
  }
}

export * as v2 from "./v2/index.js";
