import { Accessor, createSignal, type JSX, type ParentProps } from "solid-js";
import { acceptMime } from "./util";

export interface FileDropAreaProps {
  class?: string;
  classList?: Record<string, boolean>;
  style?: JSX.CSSProperties | string;
  accept?: string[];

  onDrop?: (file?: File) => void;
  onClick?: (e: MouseEvent) => void;

  children?: JSX.Element | ((state: Accessor<DragState>) => JSX.Element);
}

export type DragState = "normal" | "over" | "drop" | "failure";

export function FileDropArea(props: FileDropAreaProps) {
  const [state, setState] = createSignal<DragState>("normal");

  return (
    <div
      class={props.class}
      classList={props.classList}
      style={props.style}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onClick={props.onClick}
      onDrop={(e) => {
        e.preventDefault();

        const file = e.dataTransfer?.files?.item(0);
        if (!file) return;

        if (props.accept && !acceptMime(props.accept, file.type)) {
          setState("failure");
          return;
        }
        props.onDrop?.(e.dataTransfer?.files?.item(0) ?? void 0);
        setState("drop");
      }}
    >
      {typeof props.children == "function"
        ? props.children(state)
        : props.children}
    </div>
  );
}
