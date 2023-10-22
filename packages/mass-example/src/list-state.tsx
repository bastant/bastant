import { ListModel, createListState } from "@mass/form";
import { For, createSignal, createUniqueId } from "solid-js";

interface Model extends ListModel {
  id: string;
  name: string;
}

export default function ListState() {
  const [list, setList] = createSignal<Model[]>([
    {
      id: createUniqueId(),
      name: "Hello, World 1",
    },
    {
      id: createUniqueId(),
      name: "Hello, World 2",
    },
  ]);

  const state = createListState(list);

  return (
    <div>
      <button
        onClick={() => {
          setList([{ name: "Osten", id: createUniqueId() }]);
        }}
      >
        Reset
      </button>
      <For each={state.items()}>
        {(item) => {
          console.log(item);
          return (
            <div>
              <div>value: {item.value.name}</div>
              <button onClick={() => state.delete(item.id)}>Delete</button>
              <button
                onClick={() =>
                  state.update(item.id, {
                    ...item.value,
                    name: item.value.name + "2000",
                  })
                }
              >
                Update
              </button>
            </div>
          );
        }}
      </For>
      <button
        onClick={() => {
          const id = state.create({ name: "Hello, World new" });
          console.log("create", id);
        }}
      >
        Create
      </button>
      <h1>Operations</h1>
      <For each={state.ops()}>
        {(op) => {
          let out = (() => {
            switch (op.type) {
              case "create":
                return `create: ${op.value.name}`;
              case "update":
                return `update: ${op.value.name}`;
              case "delete":
                return `delete: ${op.id}`;
            }
          })();
          return <div>{out}</div>;
        }}
      </For>
    </div>
  );
}
