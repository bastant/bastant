export function getValue<T extends HTMLElement>(el: T) {
  if (el instanceof HTMLInputElement) {
    switch (el.type) {
      case "number":
        return el.valueAsNumber;
      case "date":
        return el.valueAsDate;
      case "file":
        return el.files;
      case "checkbox":
        return el.checked;
      default:
        return el.value;
    }
  } else if (el instanceof HTMLTextAreaElement) {
    return el.value;
  } else if (el instanceof HTMLSelectElement) {
    return el.value;
  } else {
    return el.textContent;
  }
}

export function setValue<T extends HTMLElement>(el: T, value: unknown) {
  if (el instanceof HTMLInputElement) {
    if (el.type == "checkbox") {
      el.checked = !!value;
    } else {
      el.value = value + "";
    }
  } else if (el instanceof HTMLSelectElement) {
    el.value = String(value);
  }
}

const _has = Object.prototype.hasOwnProperty;
export function has(item: unknown, prop: string | number | symbol): boolean {
  return _has.call(item, prop);
}
