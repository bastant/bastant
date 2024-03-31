import { For, createUniqueId } from "solid-js";
import {
  ReactiveValue,
  createReactiveRefList,
  fromValue,
} from "@bastant/reactive";

function random(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default function () {
  const list = createReactiveRefList(
    () => ["Hello", "World!"],
    (item) => new ReactiveValue(item)
  );

  const object = fromValue({
    name: "Rasmus",
    age: 40,
    cats: [{ name: "Wilbur", age: 15 }],
  });

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const idx = random(0, list.length - 1);
          list[idx].$update(`Random stuff baby: ${createUniqueId()}`);
          object.name = "Rasmus Kildevæld";
        }}
      >
        Update random
      </button>
      <button
        type="button"
        onClick={() => {
          list.push("New stuff");
        }}
      >
        DD
      </button>
      <p>
        Name: {object.name}, age: {object.age}
        First: {object.cats[0].name}
      </p>
      <For each={list}>{(item) => <div>{item.data}</div>}</For>
    </div>
  );
}
