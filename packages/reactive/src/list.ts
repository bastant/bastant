import { type Trigger, createTrigger } from "@solid-primitives/trigger";
import {
  type Accessor,
  batch,
  createEffect,
  on,
  untrack,
  $TRACK,
} from "solid-js";
import { AReactiveItem, type IReactiveItem, Value } from "./types.js";
import { ReactiveValue } from "./value.js";

export type Factory<T, C extends IReactiveItem<T>> = (item: T) => C;

export interface IReactiveReadonlyList<T> extends Iterable<T> {
  readonly length: number;
  items(): T[];
  at(index: number): T | undefined;
}

export interface IReactiveList<T, C = T>
  extends IReactiveItem<T[], C[]>,
    IReactiveReadonlyList<C> {
  push(...items: T[]): void;
  pop(): T | undefined;
  insert(idx: number, value: T): boolean;
  truncate(len: number): void;
  slice(start?: number, end?: number): IReactiveList<T, C>;
}

export class ReactiveList<T> extends AReactiveItem implements IReactiveList<T> {
  #items: T[];
  #trigger: Trigger;

  constructor(items: T[] = []) {
    super();
    this.#items = items;
    this.#trigger = createTrigger();
  }
  $data() {
    return this.items();
  }
  $update(items: T[]): void {
    this.#items = [...items];
    this.#trigger[1]();
  }

  get length(): number {
    this.#trigger[0]();
    return this.#items.length;
  }

  at(index: number): T | undefined {
    this.#trigger[0]();
    return this.#items[index];
  }

  push(...items: T[]): void {
    this.#items.push(...items);
    this.#trigger[1]();
  }

  pop(): T | undefined {
    if (!this.#items.length) return;
    const ret = this.#items.pop();
    this.#trigger[1]();
    return ret;
  }

  insert(idx: number, value: T): boolean {
    if (idx >= this.#items.length) {
      return false;
    }

    this.#items[idx] = value;

    this.#trigger[1]();

    return true;
  }

  items(): T[] {
    this.#trigger[0]();
    return [...this.#items];
  }

  truncate(len: number): void {
    this.#items.length = Math.min(this.#items.length, len);
    this.#trigger[1]();
  }

  slice(start?: number, end?: number | undefined): IReactiveList<T, T> {
    this.#trigger[0]();
    const sliced = this.#items.slice(start, end);
    return new ReactiveList(sliced);
  }

  [Symbol.iterator](): Iterator<T, any, undefined> {
    return this.items()[Symbol.iterator]();
  }
}

export class ReactiveRefList<T, C extends IReactiveItem<T>>
  extends AReactiveItem
  implements IReactiveList<T, C>, IReactiveItem<T[], C[]>
{
  #items: ReactiveList<C>;
  #factory: Factory<T, C>;

  constructor(items: T[], factory: Factory<T, C>) {
    super();
    this.#items = new ReactiveList(items.map(factory));
    this.#factory = factory;
  }
  $data() {
    return this.items();
  }

  $update(items: T[]): void {
    batch(() => {
      for (
        let i = 0, len = Math.min(items.length, this.#items.length);
        i < len;
        i++
      ) {
        this.#items.at(i)?.$update(items[i]);
      }

      if (items.length > this.#items.length) {
        for (let i = this.#items.length; i < items.length; i++) {
          const data = items[i];
          this.#items.push(this.#factory(data));
        }
      } else if (items.length < this.#items.length) {
        this.#items.truncate(items.length);
      }
    });
  }
  at(index: number): C | undefined {
    return this.#items.at(index);
  }
  truncate(len: number): void {
    this.#items.truncate(len);
  }

  [Symbol.iterator](): Iterator<C, unknown, undefined> {
    return this.#items[Symbol.iterator]();
  }

  get length() {
    return this.#items.length;
  }

  push(...items: T[]) {
    this.#items.push(...items.map((m) => this.#factory(m)));
  }

  pop() {
    const ret = this.#items.pop();
    return untrack(() => ret?.$data());
  }

  insert(idx: number, value: T): boolean {
    if (idx >= this.#items.length) {
      return false;
    }

    this.#items.at(idx)?.$update(value);

    return true;
  }

  slice(
    start?: number | undefined,
    end?: number | undefined
  ): IReactiveList<T, C> {
    const output = new ReactiveRefList([], this.#factory);
    output.#items = this.#items.slice(start, end) as unknown as ReactiveList<C>;
    return output;
  }

  items() {
    return this.#items.items();
  }
}

export type ReactiveArray<T, C> = IReactiveList<T, C> & Array<C>;

function createProxy<T, C>(
  list: IReactiveList<T, C> & IReactiveItem<T[], C[]>,
  items: Accessor<T[] | undefined>
): ReactiveArray<T, C> {
  createEffect(
    on(
      items,
      (items) => {
        if (items) {
          list.$update(items);
        }
      },
      { defer: true }
    )
  );

  return new Proxy(
    {
      at(idx: number) {
        return list.at(idx);
      },
      insert(idx: number, value: T) {
        return list.insert(idx, value);
      },
      get length() {
        return list.length;
      },
      push(...args: T[]) {
        list.push(...args);
      },
      pop() {
        return list.pop();
      },
      items() {
        return list.items();
      },
      [Symbol.iterator]() {
        return list[Symbol.iterator]();
      },
      truncate(len) {
        return list.truncate(len);
      },
      slice(start, end) {
        return list.slice(start, end);
      },
      $update(value: T[]) {
        return list.$update(value);
      },
      $data() {
        return list.$data();
      },
    } satisfies IReactiveList<T, C>,
    {
      get(target, p, receiver) {
        let idx = Number.NaN;
        try {
          idx = Number.parseInt(p as string);
        } catch {}

        if (!Number.isNaN(idx)) {
          return target.at(idx);
        }

        if (p === $TRACK) {
          return target.$data();
        }

        return Reflect.get(target, p, receiver);
      },
      set(target, p, newValue, receiver) {
        let idx = Number.NaN;
        try {
          idx = Number.parseInt(p as string);
        } catch {}
        if (!Number.isNaN(idx)) {
          return target.insert(idx, newValue);
        }
        return Reflect.set(target, p, newValue, receiver);
      },
    }
  ) as unknown as ReactiveArray<T, C>;
}

export function createReactiveList<T, C>(
  items: Accessor<T[] | undefined>
): ReactiveArray<T, T> {
  const list = new ReactiveList<T>(items());
  return createProxy(list, items);
}

export function createReactiveRefList<T, C extends IReactiveItem<T>>(
  items: Accessor<T[] | undefined>,
  factory: Factory<T, C>
): ReactiveArray<T, C> {
  const list = new ReactiveRefList<T, C>(items() ?? [], factory);
  return createProxy(list, items);
}
