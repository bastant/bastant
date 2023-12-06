import { Validation } from "@bastant/form";

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  js: "application/javascript",
};

export function acceptMime(accepts: string[], mime: string): boolean {
  return accepts.some((m) => {
    return m === mime || EXT_MIME[m] == mime;
  });
}

export function file(msg?: string): Validation {
  return {
    name: "file",
    message:
      msg ??
      ((name?: string) =>
        name ? `${name} is not a file` : `field is not a file`),
    validate: (v) => {
      return v instanceof File;
    },
  };
}

export function blob(msg?: string): Validation {
  return {
    name: "blob",
    message:
      msg ??
      ((name?: string) =>
        name ? `${name} is not a blob` : `field is not a blob`),
    validate: (v) => {
      return v instanceof Blob;
    },
  };
}

export function mime(accepts: string[], msg?: string): Validation {
  return {
    name: "mime",
    message:
      msg ??
      ((name?: string) =>
        name
          ? `${name} does not match any of ${accepts.join(", ")}`
          : `field does not match any of ${accepts.join(", ")}`),
    validate: (v) => {
      if (v && v instanceof Blob) {
        return acceptMime(accepts, v.type);
      } else {
        return false;
      }
    },
  };
}
