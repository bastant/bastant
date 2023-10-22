import {
  Match,
  ParentProps,
  Switch,
  children,
  createMemo,
  type JSX,
} from "solid-js";

export interface StackViewProps {
  idx?: number;
  fallback?: JSX.Element;
}

export function StackView(props: ParentProps<StackViewProps>) {
  const resolved = children(() => props.children);

  const out = createMemo(() => {
    return resolved
      .toArray()
      .map((el, idx) => <Match when={props.idx == idx}>{el}</Match>);
  });
  return <Switch fallback={props.fallback}>{out()}</Switch>;
}
