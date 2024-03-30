import {
  Accessor,
  ParentProps,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  useContext,
} from "solid-js";
import { Container } from "./di/container.js";

const CONTEXT = createContext<Container>();

export function useContainer(): Container {
  const ctx = useContext(CONTEXT);
  return ctx ?? Container.global();
}

export function IoCContainer(props: ParentProps) {
  const parent = useContainer();

  return (
    <CONTEXT.Provider value={parent?.createChild() ?? new Container()}>
      {props.children}
    </CONTEXT.Provider>
  );
}

export function get<T>(key: unknown): Accessor<T> {
  const container = useContainer();
  return createMemo(() => container.get(key)) as Accessor<T>;
}

export function register(key: unknown, value: unknown) {
  const container = useContainer();
  container.registerHandler(key, () => value);
}

export function unregister(key: unknown) {
  const container = useContainer();
  container.unregister(key);
}
