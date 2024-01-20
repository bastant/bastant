import { ListModel, createListState2 } from "@bastant/form";
import {
  For,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
} from "solid-js";
import { TransistorList } from "@bastant/animate";

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

  const state = createListState2(() => list().map((m) => ({ ...m })));

  return (
    <div>
      <button
        onClick={() => {
          state.reset();
        }}
      >
        Reset
      </button>
      <TransistorList
        exit="keep-index"
        enter={(el) =>
          el.animate(
            [
              { opacity: 0, height: 0 },
              { opacity: 1, height: el.clientHeight + "px" },
            ],
            { duration: 200 }
          )
        }
        leave={(el) =>
          el.animate(
            [
              { opacity: 1, height: el.clientHeight + "px" },
              { opacity: 0, height: 0 },
            ],
            { duration: 200 }
          )
        }
      >
        <For each={state.items()}>
          {(item) => {
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
      </TransistorList>
      <button
        onClick={() => {
          const id = state.create({ name: "Hello, World new" });
          console.log("create", id);
        }}
      >
        Create
      </button>
      <h1>Operations</h1>

      <TransistorList
        enter={(el) =>
          el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 })
        }
        leave={(el) =>
          el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 })
        }
      >
        <For each={state.ops()}>
          {(op) => {
            let out = createMemo(() => {
              switch (op.type) {
                case "create":
                  return `create: ${op.value.name}`;
                case "update":
                  return `update: ${op.value.name}`;
                case "delete":
                  return `delete: ${op.id}`;
              }
            });
            return <div>{out()}</div>;
          }}
        </For>
      </TransistorList>
    </div>
  );
}
