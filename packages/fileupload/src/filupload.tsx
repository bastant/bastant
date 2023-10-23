import {
  createComputed,
  createEffect,
  createRenderEffect,
  createSignal,
} from "solid-js";
import type { JSX } from "solid-js";

import { UploadButton } from "./upload-button.jsx";
import { FileDropArea } from "./droparea.jsx";

export interface FileInputProps {
  onChange?: (files: File | undefined) => void;
  value?: File;
  accepts?: string[];
  class?: string;
  classList?: Record<string, string>;
  style?: JSX.CSSProperties;
}

export function FileInput(props: FileInputProps) {
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

  const onChange = (file?: File) => {
    props.onChange?.(file);
    setFile(file);
  };

  return (
    <FileDropArea
      style={{ height: "200px", width: "200px", background: "red" }}
      onDrop={onChange}
    >
      <UploadButton
        style={{ height: "100%", width: "100%" }}
        value={file()}
        accept={props.accepts}
        onChange={onChange}
      >
        {(file) => <>{file?.name}</>}
      </UploadButton>
      <p>{file()?.name}</p>
    </FileDropArea>
  );
}
