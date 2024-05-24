import { type Accessor, createEffect, onCleanup } from "solid-js";

export function createClickOutsideEffect<T extends HTMLElement>(
  el: Accessor<T>,
  func: (e: MouseEvent) => unknown
) {
  createEffect(() => {
    const element = el();
    if (!element) return;
    const onClick = (e: MouseEvent) => {
      !element.contains(e.target as Node) && element !== e.target && func(e);
    };
    document.body.addEventListener("click", onClick);

    onCleanup(() => {
      document.body.removeEventListener("click", onClick);
    });
  });
}

export function clickOutside<T extends HTMLElement>(
  el: T,
  accessor: () => (() => unknown) | undefined
) {
  createClickOutsideEffect(
    () => el,
    (e: MouseEvent) => accessor()?.()
  );
}

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      clickOutside: (e: MouseEvent) => unknown;
    }
  }
}
