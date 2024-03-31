import { Trigger, createTrigger } from "@solid-primitives/trigger";
import {
  AReactiveItem,
  Equality,
  IReactiveItem,
  RealValue,
  Value,
  isReactiveItem,
} from "./types.js";
import { ReactiveValue } from "./value.js";
import { batch } from "solid-js";
import {
  IReactiveList,
  ReactiveArray,
  ReactiveList,
  createReactiveList2,
} from "./list.js";

export class ReactiveObject<T extends Record<string, IReactiveItem<unknown>>>
  extends AReactiveItem
  implements IReactiveItem<T>
{
  #trigger: Trigger;
  #value: T;
  #shouldTrigger: boolean;

  constructor(object: T, shouldTrigger = true) {
    super();
    this.#trigger = createTrigger();
    this.#value = { ...object };
    this.#shouldTrigger = shouldTrigger;
  }

  get<K extends keyof T>(key: K): Value<T[K]> | undefined {
    const value = this.#value[key];
    if (!value) return;
    if (this.#shouldTrigger) this.#trigger[0]();
    if (value instanceof ReactiveValue) {
      return value.data;
    } else {
      return value as Value<T[K]>;
    }
  }

  set<K extends keyof T>(key: K, value: RealValue<T[K]> | Value<T[K]>) {
    if (isReactiveItem(value)) {
      value = value.data as any;
    }

    const prop = this.#value[key];
    prop.update(value);
    if (this.#shouldTrigger) this.#trigger[1]();
  }

  get data() {
    if (this.#shouldTrigger) this.#trigger[0]();
    return this.#value;
  }

  update(value: T) {
    batch(() => {
      for (const key in value) {
        this.set(key, value[key] as any);
      }

      if (this.#shouldTrigger) this.#trigger[1]();
    });
  }
}

export type ReactiveObjectType<T> = { [K in keyof T]: Value<T[K]> };

function createObjectProxy<T extends Record<string, IReactiveItem<unknown>>>(
  object: ReactiveObject<T>
): ReactiveObjectType<T> {
  return new Proxy(object, {
    get(target, key) {
      return target.get(key as any);
    },
    set(target, key, value) {
      target.set(key as any, value);
      return true;
    },
  }) as { [K in keyof T]: Value<T[K]> };
}

export type Reactive<T> = {
  [P in keyof T]: Value<T[P]>;
};

export function createObject<T extends Record<string, IReactiveItem<unknown>>>(
  factory: T,
  shouldTrigger = true
): Reactive<T> {
  return createObjectProxy(new ReactiveObject(factory, shouldTrigger));
}

type ReactiveType<T> = T extends Array<infer V>
  ? ReactiveArray<ReactiveType<V>, ReactiveType<V>>
  : T extends { [key: string]: unknown }
  ? ReactiveObjectType<{ [P in keyof T]: ReactiveType<T[P]> }>
  : ReactiveValue<T>;

export function fromValue<T>(object: T, equal?: Equality<T>): ReactiveType<T> {
  if (Array.isArray(object)) {
    return fromArray(object, equal) as any;
  } else if (isPlainObject(object)) {
    return fromObject(object as any, equal) as any;
  } else {
    return new ReactiveValue(object) as any;
  }
}

export function fromArray<T extends object>(
  list: T[],
  equal?: Equality<T>
): ReactiveArray<ReactiveType<T>, ReactiveType<T>> {
  const mapped = list.map((m) => fromValue(m, equal));
  return createReactiveList2(() => mapped);
}

export function fromObject<T extends Record<string, IReactiveItem<unknown>>>(
  object: T,
  equal?: Equality<T>
): ReactiveObjectType<{ [K in keyof T]: ReactiveType<T[K]> }> {
  const output: { [K in keyof T]: ReactiveType<T[K]> } = {} as any;
  for (const key in object) {
    output[key] = fromValue(object[key] as any, equal) as any;
  }

  return createObjectProxy(new ReactiveObject(output, true));
}

function isObject(o: any) {
  return Object.prototype.toString.call(o) === "[object Object]";
}

export function isPlainObject(o: any): o is Record<string, unknown> {
  var ctor, prot;

  if (isObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty("isPrototypeOf") === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}
