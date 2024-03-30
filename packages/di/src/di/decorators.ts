import type { Constructor } from "./types.js";
import * as util from "./utils.js";

export type Args<T> = T extends (target: any, ...args: infer P) => any
  ? P
  : any;

function makeDecorator<T extends (target: any, ...args: any[]) => any>(
  decorator: T
): (
  ...args: Args<T>
) => <V extends Constructor<any>>(
  target: V,
  context: ClassDecoratorContext<V>
) => any {
  return (...args: Args<T>) => {
    return function <V extends Constructor<any>>(target: V) {
      decorator(target, ...args);
    };
  };
}

export const instanceActivator = makeDecorator(util.instanceActivator);
export const dependencyResolver = makeDecorator(util.dependencyResolve);
export const singleton = makeDecorator(util.singleton);
export const transient = makeDecorator(util.transient);
export const inject = makeDecorator(util.inject);
