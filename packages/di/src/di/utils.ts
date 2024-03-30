import type {
  Func,
  IActivator,
  IDependencyResolver,
  IRegistor,
} from "./types.js";
import {
  TransientRegistration,
  SingletonRegistration,
} from "./registration.js";
import { CustomActivator, FactoryActivator } from "./activation.js";
import { MetaKeys, defineMetadata } from "./metadata.js";

export function inject<T extends object>(target: T, ...rest: any[]): T {
  defineMetadata(MetaKeys.paramTypes, rest, target);
  return target;
}

export function registration<T extends object>(target: T, value: IRegistor): T {
  defineMetadata(MetaKeys.registration, value, target);
  return target;
}

export function transient<T extends object>(target: T, key?: any): T {
  registration(target, new TransientRegistration(key));
  return target;
}

export function singleton<T extends object>(
  target: T,
  key?: any,
  registerInChild?: boolean
): T;
export function singleton<T extends object>(
  target: T,
  registerInChild?: boolean
): T;
export function singleton<T extends object>(
  target: T,
  keyOrRegisterInChild?: any,
  registerInChild: boolean = false
) {
  return registration(
    target,
    new SingletonRegistration(keyOrRegisterInChild, registerInChild)
  );
}

export function instanceActivator<T extends object>(
  target: T,
  value: IActivator,
  targetKey?: string
): T {
  defineMetadata(MetaKeys.instanceActivator, value, target, targetKey);
  return target;
}

export function factory<T extends object>(target: T) {
  return instanceActivator(target, FactoryActivator.instance);
}

export function custom<T extends object>(
  target: T,
  factory: (fn: Func<unknown, any>, args: unknown[] | undefined) => unknown
) {
  return instanceActivator(target, new CustomActivator(factory));
}

export function dependencyResolve<T extends object>(
  target: T,
  value: IDependencyResolver,
  targetKey?: string
): T {
  defineMetadata(MetaKeys.dependencyResolver, value, target, targetKey);
  return target;
}
