import deepEqual from "deep-equal";
import { AReactiveItem, type Equality, type IReactiveItem } from "./types.js";
import { type Trigger, createTrigger } from "@solid-primitives/trigger";

export class Bag<T extends object>
  extends AReactiveItem
  implements IReactiveItem<Partial<T>>
{
  #trigger: Trigger;
  #item: Partial<T> = {};
  #equal: Equality<unknown>;

  constructor(
    initial: Partial<T> = {},
    equal: Equality<unknown> = (a, b) => a === b
  ) {
    super();
    this.#trigger = createTrigger();
    this.#item = initial ?? {};
    this.#equal = equal;
  }

  get data() {
    this.#trigger[0]();
    return this.#item;
  }

  $data() {
    return this.data;
  }

  $update(item: Partial<T>): void {
    this.#item = { ...item };
    this.#trigger[1]();
  }

  set<K extends keyof T>(key: K, value: T[K] | undefined) {
    if (this.#equal(this.#item[key], value)) {
      return;
    }

    this.#item[key] = value;
    this.#trigger[1]();
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    this.#trigger[0]();
    return this.#item[key];
  }

  clear() {
    this.#item = {};
    this.#trigger[1]();
  }
}

export function createBag<T extends object>(
  initial: Partial<T>
): T & { $clear(): void; $data(): Partial<T> } {
  const bag = new Bag(initial, deepEqual);

  return new Proxy(
    {
      $clear() {
        bag.clear();
      },
      $data() {
        return bag.data;
      },
      $set(key: any, value: any) {
        bag.set(key, value);
      },
      $get(key: any) {
        return bag.get(key);
      },
    },
    {
      get(target, p) {
        if (p == "$clear") {
          return target.$clear;
        } else if (p == "$data") {
          return target.$data;
        }
        return target.$get(p as any);
      },
      set(target, p, newValue) {
        target.$set(p as any, newValue);
        return true;
      },
    }
  ) as any;
}
