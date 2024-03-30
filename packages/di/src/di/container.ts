import { ClassActivator } from "./activation.js";
import { BadKeyError, ContainerError } from "./error.js";
import {
  type SectionType,
  defineMetadata,
  getMetadata,
  MetaKeys,
} from "./metadata.js";
import { InstanceRegistration, TransientRegistration } from "./registration.js";
import { Resolver } from "./resolving.js";
import type {
  ConstructionInfo,
  Func,
  IActivator,
  IContainer,
  IDependencyResolver,
  IHandlerFunc,
  IRegistor,
} from "./types.js";

const EMPTY_PARAMS = Object.freeze([]) as unknown as any[];

export class Container implements IContainer, IActivator, IDependencyResolver {
  #entries: Map<any, IHandlerFunc[]> = new Map();
  #constructionInfo: Map<Function, ConstructionInfo>;
  readonly parent?: IContainer;

  constructor(info?: Map<Function, ConstructionInfo>, parent?: IContainer) {
    this.parent = parent;
    this.#constructionInfo = info ?? new Map();
  }

  get root(): IContainer {
    let root: IContainer = this,
      tmp: IContainer | undefined = root;
    while (tmp) {
      tmp = root.parent;
      if (tmp) root = tmp;
    }
    return root;
  }

  unregister(key: unknown) {
    this.#entries.delete(key);
  }

  /**
   * Creates a new dependency injection container whose parent is the current container.
   *
   * @method createChild
   * @return {Container} Returns a new container instance parented to this.
   */
  createChild(): Container {
    let childContainer = new Container(this.#constructionInfo, this);
    return childContainer;
  }

  autoRegister(fn: any, key?: any, targetKey?: SectionType): void {
    var registration: IRegistor | undefined;
    let container = this;
    if (fn === null || fn === undefined) {
      throw new BadKeyError();
    }
    if (typeof fn === "function") {
      registration = getMetadata(
        MetaKeys.registration,
        fn,
        targetKey
      ) as IRegistor;

      if (registration !== undefined) {
        registration.register(container, key || fn, fn);
      } else {
        new TransientRegistration().register(container, key || fn, fn);
      }
    } else {
      new InstanceRegistration().register(container, key || fn, fn);
    }
  }

  get(key: unknown, targetKey?: SectionType): unknown {
    let entry: IHandlerFunc[] | undefined;

    if (key === null || key === undefined) {
      throw new BadKeyError();
    }

    if (key === Container) {
      return this;
    }

    if (key instanceof Resolver) {
      return key.get(this);
    }

    entry = this.#entries.get(key);

    if (entry !== undefined) {
      return entry[0](this);
    }

    if (this.parent && this.parent.hasHandler(key, true)) {
      return this.parent.get(key);
    }

    // No point in auto registrering a string or symbol or number
    if (
      typeof key === "string" ||
      typeof key === "symbol" ||
      typeof key === "number"
    ) {
      throw new ContainerError(
        "no component registered for key: " + String(key)
      );
    }

    this.autoRegister(key, null, targetKey);
    entry = this.#entries.get(key);

    return entry?.[0](this);
  }

  getAll(key: unknown): unknown[] {
    let entry;

    if (key === null || key === undefined) {
      throw new BadKeyError();
    }

    entry = this.#entries.get(key);

    if (entry !== undefined) {
      return entry.map((x) => x(this));
    }

    if (this.parent) {
      return this.parent.getAll(key);
    }

    return [];
  }
  hasHandler(key: any, parent: boolean): boolean {
    return (
      this.#entries.has(key) ||
      (parent && this.parent && this.parent.hasHandler(key, parent)) ||
      false
    );
  }
  registerHandler(
    key: any,
    handler: IHandlerFunc,
    section?: SectionType
  ): void {
    this.#getOrCreateEntry(key).push(handler);
  }

  invoke(
    fn: Func<unknown, any[]>,
    deps?: unknown[] | undefined,
    targetKey?: SectionType
  ): unknown {
    let info = this.#getOrCreateConstructionSet(fn, targetKey);

    try {
      let args;
      if (info.dependencyResolver) {
        args = info.dependencyResolver.resolveDependencies(fn);
      } else {
        args = this.resolveDependencies(fn, targetKey);
      }

      if (deps !== undefined && Array.isArray(deps)) {
        args = args.concat(deps);
      }

      return info.activator.invoke(fn, args, targetKey);
    } catch (e) {
      throw e;
    }
  }

  resolveDependencies(fn: Function, targetKey?: SectionType): any[] {
    //debug("%s: Resolve dependencies for: %j", this.id, fn.name);
    var info = this.#getOrCreateConstructionSet(fn, targetKey),
      keys = info.keys,
      args = new Array(keys.length);
    let i = 0,
      ii = 0;

    try {
      for (i = 0, ii = keys.length; i < ii; ++i) {
        args[i] = this.get(keys[i]);
      }
    } catch (e) {
      throw e;
    }

    return args;
  }

  // Private
  #getOrCreateEntry(key: string): IHandlerFunc[] {
    if (key === null || key === undefined) {
      throw new ContainerError(
        "key cannot be null or undefined.  (Are you trying to inject something that doesn't exist with DI?)"
      );
    }

    var entry = this.#entries.get(key);

    if (entry === undefined) {
      entry = [];
      this.#entries.set(key, entry);
    }

    return entry;
  }

  #getOrCreateConstructionSet(
    fn: Function,
    targetKey?: SectionType
  ): ConstructionInfo {
    var info = this.#constructionInfo.get(fn);

    if (info === undefined) {
      info = this.#createConstructionSet(fn, targetKey);
      this.#constructionInfo.set(fn, info);
    }
    return info;
  }

  #createConstructionSet(
    fn: Function,
    targetKey: SectionType
  ): ConstructionInfo {
    let info: ConstructionInfo = {
      activator:
        (getMetadata(
          MetaKeys.instanceActivator,
          fn,
          targetKey
        ) as IActivator) || ClassActivator.instance,
      keys: EMPTY_PARAMS,
      dependencyResolver:
        (getMetadata(
          MetaKeys.dependencyResolver,
          fn,
          targetKey
        ) as IDependencyResolver) || this,
    };

    if ((<any>fn).inject !== undefined) {
      if (typeof (<any>fn).inject === "function") {
        info.keys = (<any>fn).inject();
      } else {
        info.keys = (<any>fn).inject;
      }

      return info;
    }

    const params = getMetadata(MetaKeys.paramTypes, fn, targetKey) as unknown[];
    if (params) {
      info.keys = params;
    }

    return info;
  }
}

export namespace Container {
  var _global: Container | undefined;

  export function makeGlobal(container: Container) {
    _global = container;
  }

  export function global() {
    if (!_global) _global = new Container();
    return _global;
  }
}
