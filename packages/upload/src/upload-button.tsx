import { FieldApi } from "@bastant/form";
import {
  createComputed,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import type { JSX } from "solid-js";

export interface UploadButtonProps {
  accept?: string[];
  class?: string;
  style?: JSX.CSSProperties | string;
  onChange?: (file: File | undefined) => void;
  value?: File;
  children?: ((file: File | undefined) => JSX.Element) | JSX.Element;
  field?: FieldApi<File>;
}

export function UploadButton(props: UploadButtonProps) {
  const accept = createMemo(() => props.accept?.join("") ?? void 0);

  let inputRef: HTMLInputElement | undefined;

  const [file, setFile] = createSignal<File | undefined>();

  createComputed(() => {
    const value = props.value;
    const target = new DataTransfer();
    if (value) {
      target.items.add(value);
    }

    setFile(value);

    if (inputRef) inputRef.files = target.files;
  });

  createEffect(() => {
    if (!props.field || !inputRef) {
      return;
    }

    const value = props.field!.value();
    if (value) {
    }
  });

  return (
    <label class={props.class} style={props.style}>
      <input
        ref={inputRef}
        type="file"
        accept={accept()}
        onChange={(e) => {
          const file = e.currentTarget.files?.item(0) ?? void 0;
          setFile(file);
          props.onChange?.(file);
          props.field?.setValue(file);
        }}
      />
      {typeof props.children == "function"
        ? props.children(file())
        : props.children}
    </label>
  );
}
