import { SectionType } from "./metadata.js";
import { Func, IContainer, IRegistor } from "./types.js";

/**
 * Used to allow functions/classes to indicate that they should be registered as transients with the container.
 *
 * @class TransientRegistration
 * @constructor
 * @param {Object} [key] The key to register as.
 */
export class TransientRegistration implements IRegistor {
  key?: any;
  constructor(key?: any) {
    this.key = key;
  }

  /**
   * Called by the container to register the annotated function/class as transient.
   *
   * @method register
   * @param {Container} container The container to register with.
   * @param {Object} key The key to register as.
   * @param {Object} fn The function to register (target of the annotation).
   */
  register(container: IContainer, key: unknown, target: Func<unknown>): void {
    key = this.key ?? key;
    container.registerHandler(key, (x) => x.invoke(target, void 0));
  }
}

/* Used to allow functions/classes to indicate that they should be registered as singletons with the container.
 *
 * @class SingletonRegistration
 * @constructor
 * @param {Object} [key] The key to register as.
 */
export class SingletonRegistration implements IRegistor {
  registerInChild: boolean;
  key: any;
  constructor(keyOrRegisterInChild?: any, registerInChild: boolean = false) {
    if (typeof keyOrRegisterInChild === "boolean") {
      this.registerInChild = keyOrRegisterInChild;
    } else {
      this.key = keyOrRegisterInChild;
      this.registerInChild = registerInChild;
    }
  }

  /**
   * Called by the container to register the annotated function/class as a singleton.
   *
   * @method register
   * @param {Container} container The container to register with.
   * @param {Object} key The key to register as.
   * @param {Object} fn The function to register (target of the annotation).
   */
  register(
    container: IContainer,
    key: unknown,
    target: Func<unknown>,
    section?: SectionType
  ): void {
    var destination = this.registerInChild ? container : container.root;
    key = this.key ?? key;
    let singleton: any;
    destination.registerHandler(key, (x) => {
      if (!singleton) {
        singleton = x.invoke(target, void 0, section);
      }

      return singleton;
    });
  }
}

export class InstanceRegistration implements IRegistor {
  register(container: IContainer, key: unknown, target: unknown): void {
    container.registerHandler(key, () => target);
  }
}
