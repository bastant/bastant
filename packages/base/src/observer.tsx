import { createVisibilityObserver } from "@solid-primitives/intersection-observer";
import {
  Accessor,
  JSX,
  ParentProps,
  createContext,
  splitProps,
  useContext,
} from "solid-js";

type FalsyValue = false | 0 | "" | null | undefined;

const CONTEXT = createContext<
  | ((el: Element | Accessor<Element | FalsyValue>) => Accessor<boolean>)
  | undefined
>();

export function VisibilityObserver(
  props: ParentProps<IntersectionObserverInit>
) {
  const [options, ...rest] = splitProps(props, ["children"]);

  const useObserver = createVisibilityObserver({
    ...(rest as IntersectionObserverInit),
  });

  return (
    <CONTEXT.Provider value={useObserver}>{options.children}</CONTEXT.Provider>
  );
}

export function useVisibilityObserver<E extends Element>(
  el: Accessor<E>,
  options?: IntersectionObserverInit
) {
  const context = useContext(CONTEXT);
  if (!context || !!options) {
    return createVisibilityObserver(options)(el);
  }

  return context(el);
}
