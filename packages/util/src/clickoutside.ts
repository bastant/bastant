import { Accessor, createEffect, onCleanup } from "solid-js";

export function createClickout<T extends HTMLElement>(
  el: Accessor<T>,
  func: () => unknown
) {
  createEffect(() => {
    const element = el();
    if (!element) return;
    const onClick = (e: Event) => {
      !element.contains(e.target as Node) && element !== e.target && func();
    };
    document.body.addEventListener("click", onClick);

    onCleanup(() => {
      document.body.removeEventListener("click", onClick);
    });
  });
}

export function clickOutside<T extends HTMLElement>(
  el: T,
  accessor: () => (() => any) | undefined
) {
  createClickout(
    () => el,
    () => accessor()?.()
  );
}

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      clickOutside: () => any;
    }
  }
}
