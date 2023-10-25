import { onCleanup } from "solid-js";

export function clickOutside<T extends HTMLElement>(
  el: T,
  accessor: () => (() => any) | undefined
) {
  const onClick = (e: Event) => {
    !el.contains(e.target as Node) && el !== e.target && accessor()?.();
  };
  document.body.addEventListener("click", onClick);

  onCleanup(() => {
    document.body.removeEventListener("click", onClick);
  });
}

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      clickOutside: () => any;
    }
  }
}

export function keypressOutside<T extends HTMLElement>(
  el: T,
  accessor: () => ((event: KeyboardEvent) => any) | undefined
) {
  const onClick = (e: KeyboardEvent) => {
    accessor()?.(e);
  };
  document.body.addEventListener("keydown", onClick);

  onCleanup(() => document.body.removeEventListener("keydown", onClick));
}

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      keypressOutside: (event: KeyboardEvent) => any;
    }
  }
}
