import { SectionType } from "./metadata.js";

export type Func<R, A extends unknown[] = any[]> = (...args: A) => R;

export type Constructor<T, A extends unknown[] = any[]> = new (...args: A) => T;

export interface IActivator {
  invoke(fn: Func<unknown>, args?: unknown[], targetKey?: SectionType): unknown;
}

export interface IRegistor {
  register(
    container: IContainer,
    key: unknown,
    target: unknown,
    section?: SectionType
  ): void;
}

export interface IDependencyResolver {
  resolveDependencies(fn: Func<unknown>, targetKey?: SectionType): unknown[];
}

export interface IContainer {
  readonly parent?: IContainer;
  readonly root: IContainer;
  get(key: unknown): unknown;
  getAll(key: unknown): unknown[];
  hasHandler(key: any, parent: boolean): boolean;
  registerHandler(key: any, handler: IHandlerFunc): void;
}

export interface IHandlerFunc {
  (c: IActivator): any;
}

export interface IResolver {
  /**
   * Called by the container to allow custom resolution of dependencies for a function/class.
   *
   * @method get
   * @param {Container} container The container to resolve from.
   * @return {Object} Returns the resolved object.
   */
  get(container: IContainer): any;
}

export interface ConstructionInfo {
  activator: IActivator;
  keys: unknown[];
  dependencyResolver?: IDependencyResolver;
}
