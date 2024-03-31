import { Trigger, createTrigger } from "@solid-primitives/trigger";
import { Accessor, batch, createEffect, on, untrack } from "solid-js";
import { AReactiveItem, IReactiveItem, Value } from "./types.js";
import { ReactiveValue } from "./value.js";

export type Factory<T, C extends IReactiveItem<T>> = (item: T) => C;

export interface IReactiveReadonlyList<T> extends Iterable<T> {
  readonly length: number;
  items(): T[];
  item(index: number): T | undefined;
}

export interface IReactiveList<T, C = T> extends IReactiveReadonlyList<C> {
  push(...items: T[]): void;
  pop(): T | undefined;
  insert(idx: number, value: T): boolean;
  truncate(len: number): void;
}

export class ReactiveList<T>
  extends AReactiveItem
  implements IReactiveList<T>, IReactiveItem<T[]>
{
  #items: T[];
  #trigger: Trigger;

  constructor(items: T[] = []) {
    super();
    this.#items = items;
    this.#trigger = createTrigger();
  }
  get data() {
    return this.items();
  }
  update(items: T[]): void {
    this.#items = [...items];
    this.#trigger[1]();
  }

  get length(): number {
    this.#trigger[0]();
    return this.#items.length;
  }

  item(index: number): T | undefined {
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

  constructor(items: T[] = [], factory: Factory<T, C>) {
    super();
    this.#items = new ReactiveList(items.map(factory));
    this.#factory = factory;
  }
  get data() {
    return this.items();
  }

  update(items: T[]): void {
    batch(() => {
      for (
        let i = 0, len = Math.min(items.length, this.#items.length);
        i < len;
        i++
      ) {
        this.#items.item(i)?.update(items[i]);
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
  item(index: number): C | undefined {
    return this.#items.item(index);
  }
  truncate(len: number): void {
    this.#items.truncate(len);
  }

  [Symbol.iterator](): Iterator<C, any, undefined> {
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
    return untrack(() => ret?.data);
  }

  insert(idx: number, value: T): boolean {
    if (idx >= this.#items.length) {
      return false;
    }

    this.#items.item(idx)?.update(value);

    return true;
  }

  items() {
    return this.#items.items();
  }
}

export function createReactiveRefList<T, C extends IReactiveItem<T>>(
  items: Accessor<T[] | undefined>,
  factory: Factory<T, C>
) {
  const list = new ReactiveRefList<T, C>([], factory);
  createEffect(() => {
    list.update(items() ?? []);
  });

  return list;
}

export function createReactiveList<T>(items: Accessor<T[] | undefined>) {
  const list = new ReactiveList<T>([]);
  createEffect(() => {
    list.update(items() ?? []);
  });
  return list;
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
          list.update(items);
        }
      },
      { defer: true }
    )
  );

  return new Proxy(list, {
    get(target, p, receiver) {
      let idx = NaN;
      try {
        idx = parseInt(p as string);
      } catch {}

      if (!isNaN(idx)) {
        return target.item(idx);
      } else {
        if (p == "push") {
          return (...args) => target.push(...args);
        }
        return Reflect.get(target, p);
      }
    },
    set(target, p, newValue, receiver) {
      let idx = NaN;
      try {
        idx = parseInt(p as string);
      } catch {}
      if (!isNaN(idx)) {
        return target.insert(idx, newValue);
      } else {
        return Reflect.set(target, p, newValue);
      }
    },
  }) as any;
}

export function createReactiveList2<T, C>(
  items: Accessor<T[] | undefined>
): ReactiveArray<T, T> {
  const list = new ReactiveList<T>(items());
  return createProxy(list, items);
}

export function createReactiveRefList2<T, C extends IReactiveItem<T>>(
  items: Accessor<T[] | undefined>,
  factory: Factory<T, C>
): ReactiveArray<T, C> {
  const list = new ReactiveRefList<T, C>(items(), factory);
  return createProxy(list, items);
}
