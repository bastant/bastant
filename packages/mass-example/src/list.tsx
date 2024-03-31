import { For, createUniqueId } from "solid-js";
import {
  ReactiveValue,
  createReactiveRefList2,
  fromValue,
} from "@bastant/reactive";

function random(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default function () {
  const list = createReactiveRefList2(
    () => ["Hello", "World!"],
    (item) => new ReactiveValue(item)
  );

  console.log(list.length);

  const object = fromValue({
    name: "Rasmus",
    age: 40,
  });

  return (
    <div>
      <button
        onClick={() => {
          const idx = random(0, list.length - 1);
          list[idx].update("Random stuff baby: " + createUniqueId());
          object.name = "Rasmus Kildevæld";
        }}
      >
        Update random
      </button>
      <button
        onClick={() => {
          list.push("New stuff");
        }}
      >
        DD
      </button>
      <p>
        Name: {object.name}, age: {object.age}
      </p>
      <For each={list.length ? list : null}>
        {(item) => <div>{item.data}</div>}
      </For>
    </div>
  );
}
