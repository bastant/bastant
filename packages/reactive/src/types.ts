import type { IReactiveList } from "./list.js";
import { isPlainObject, type ReactiveObject } from "./object";
import type { ReactiveValue } from "./value.js";

export type RealValue<T> = T extends ReactiveValue<infer V>
  ? V
  : T extends IReactiveList<infer V>
  ? V[]
  : T extends ReactiveObject<infer V>
  ? V
  : T;

export type Value<T> = T extends ReactiveValue<infer V> ? V : T;

export type Reactive<T> = {
  [P in keyof T]: Value<T[P]>;
};

export type Equality<T> = (a: T, b: T) => boolean;

export const $ReactiveItem = Symbol("$ReactiveItem");
export const $ReactiveItemValue = Symbol("$ReactItemValue");

export interface IReactiveItem<T, C = T> {
  // [$ReactiveItem]: unknown;
  $data(): C;
  $update(item: T): void;
}

export abstract class AReactiveItem {
  private [$ReactiveItem] = $ReactiveItemValue;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function isReactiveItem(a: any): a is IReactiveItem<unknown> {
  return a && a[$ReactiveItem] === $ReactiveItemValue;
}
