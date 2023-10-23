import { Accessor, createComputed } from "solid-js";
import { createStore, produce } from "solid-js/store";

export interface ManagedFile {
  toFile(): File;
  url(): string;
}

export class LocalFile implements ManagedFile {
  #file: File;
  constructor(file: File) {
    this.#file = file;
  }

  toFile() {
    return this.#file;
  }

  url(): string {
    return URL.createObjectURL(this.#file);
  }
}

export interface FileManagerOptions {
  files?: Accessor<ManagedFile[]>;
}

interface Store {
  files: ManagedFile[];
}

export function createFileManager(options?: FileManagerOptions) {
  const [state, setState] = createStore<Store>({
    files: [],
  });

  createComputed(() => {
    setState("files", () => options?.files?.() ?? []);
  });

  return {
    files: () => state.files,
    push: (file: ManagedFile) => {
      setState(produce((s) => s.files.push(file)));
    },
    clear() {
      setState("files", []);
      return this;
    },
  };
}
