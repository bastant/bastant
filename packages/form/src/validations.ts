import { Validation } from "./validate.js";

export function required(
  msg?: ((name?: string) => string) | string
): Validation {
  return {
    name: "required",
    message:
      msg ??
      ((name?: string) => (name ? `${name} is required` : "field is required")),
    init: (el) => {
      if (el instanceof HTMLInputElement) {
        el.required = true;
      }
    },
    validate(value) {
      return !!value;
    },
  };
}

function getNumber(value: unknown): number {
  if (value == null || value == undefined) {
    return 0;
  } else if (typeof value == "string") {
    return value.length;
  } else if (typeof value == "number") {
    return value;
  } else if (Array.isArray(value)) {
    return value.length;
  } else if (value instanceof Blob) {
    return value.size;
  } else {
    return Object.keys(value as any).length;
  }
}

export function min(
  min: number,
  msg?: ((name?: string) => string) | string
): Validation {
  return {
    name: "minimum length",
    message:
      msg ??
      ((name?: string) =>
        name ? `${name} should be at least ${min}` : "field is required"),
    validate: (v) => getNumber(v) >= min,
  };
}

export function max(
  max: number,
  msg?: ((name?: string) => string) | string
): Validation {
  return {
    name: "maximum length",
    message:
      msg ??
      ((name?: string) => (name ? `${name} is to large` : "field is required")),
    validate: (v) => getNumber(v) <= max,
  };
}

export function pattern(
  pattern: RegExp,
  msg?: ((name?: string) => string) | string
): Validation {
  return {
    name: "pattern",
    message:
      msg ??
      ((name?: string) =>
        name
          ? `${name} does not match pattern`
          : "field does not match pattern"),
    validate: (v) => pattern.test(v + ""),
  };
}
