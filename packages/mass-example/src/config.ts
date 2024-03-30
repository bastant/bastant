import { custom, inject, singleton } from "@bastant/di";
import { createUniqueId } from "solid-js";

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
  userId: string;
  constructor(test: TestInjector) {
    this.userId = "user__" + test.id;
  }
}

inject(Config, TestInjector);
singleton(Config);
