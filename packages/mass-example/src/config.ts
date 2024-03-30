import { custom, inject, singleton } from "@bastant/di";
import {
  Accessor,
  Setter,
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
} from "solid-js";

export class TestInjector {
  id: string;
  constructor(id: string) {
    this.id = id;
  }
}

custom(TestInjector, (fn) => {
  return Reflect.construct(fn, [createUniqueId()]);
});

export class Config {
  signal: [Accessor<string>, Setter<string>];
  constructor(test: TestInjector) {
    this.signal = createSignal("user__" + test.id);
  }

  get userId() {
    return this.signal[0]();
  }

  update() {
    this.signal[1]("user__" + createUniqueId());
  }
}

inject(Config, TestInjector);
singleton(Config);
