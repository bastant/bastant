import { Accessor, createComputed, createUniqueId } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { Id, ListState, Op, createListState } from "@bastant/form";

export interface ManagedFile {
  toFile(): File;
  name(): string;
  url(): string;
}

export class LocalFile implements ManagedFile {
  #file: File;
  constructor(file: File) {
    this.#file = file;
  }

  name() {
    return this.#file.name;
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

export interface FileManangerApi {
  files: Accessor<ManagedFile>;
  push(file: ManagedFile): Id;
  ops(): Accessor<Op<ManagedFile>>;
}

export function createFileManager(options?: FileManagerOptions) {
  const state = createListState<{ id: string; item: ManagedFile }>(
    () =>
      options?.files?.().map((m) => ({
        id: createUniqueId(),
        item: m,
      })) ?? []
  );

  return {
    files: () => state.items().map((m) => m.value),
    push: (file: ManagedFile) => {
      return state.create({ id: createUniqueId(), item: file });
    },
    delete: (id: Id) => {
      state.delete(id);
    },
    ops: () => {
      return state.ops().map((m) => ({
        ...m,
        value: (m as any).value?.item,
      }));
    },
    reset() {
      state.reset();
      return this;
    },
  };
}
