import { SectionType } from "./metadata.js";
import type { Func, IActivator } from "./types.js";

/**
 * Used to instantiate a class.
 *
 * @class ClassActivator
 * @constructor
 */
export class ClassActivator implements IActivator {
  static instance = new ClassActivator();

  invoke(fn: Func<unknown, any[]>, args?: unknown[] | undefined): unknown {
    return Reflect.construct(fn, args ?? []);
  }
}

/**
 * Used to invoke a factory method.
 *
 * @class FactoryActivator
 * @constructor
 */
export class FactoryActivator implements IActivator {
  static instance = new FactoryActivator();

  invoke(fn: Func<unknown, any[]>, args?: unknown[] | undefined): unknown {
    return Reflect.apply(fn, void 0, args ?? []);
  }
}

export class CustomActivator implements IActivator {
  #func: (fn: Func<unknown, any[]>, args?: unknown[] | undefined) => any;
  constructor(
    func: (fn: Func<unknown, any[]>, args?: unknown[] | undefined) => any
  ) {
    this.#func = func;
  }

  invoke(fn: Func<unknown, any[]>, args?: unknown[] | undefined): unknown {
    return this.#func(fn, args);
  }
}
