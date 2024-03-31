import { type Trigger, createTrigger } from "@solid-primitives/trigger";
import { AReactiveItem, Equality, IReactiveItem } from "./types.js";

export class ReactiveValue<T>
  extends AReactiveItem
  implements IReactiveItem<T>
{
  #equal: Equality<T>;
  #item: T;
  #trigger: Trigger;

  constructor(item: T, equal: Equality<T> = (a, b) => a === b) {
    super();
    this.#equal = equal;
    this.#item = item;
    this.#trigger = createTrigger();
  }

  get data() {
    this.#trigger[0]();
    return this.#item;
  }

  set data(data: T) {
    const trigger = !this.#equal(this.#item, data);
    this.#item = data;
    if (trigger) {
      this.#trigger[1]();
    }
  }

  update(item: T) {
    this.data = item;
  }
}
