import type { Accessor } from "solid-js";
import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  on,
  untrack,
} from "solid-js";
import { createStore } from "solid-js/store";

export type Id = string;

export interface ListModel {
  id: string | number;
}

export type NewModel<T> = Omit<T, "id"> & {
  id?: string | number;
};

export interface ListEntry<T extends ListModel> {
  id: string | number;
  value: NewModel<T> | T;
  isPersistent: boolean;
}

export type Op<T> =
  | { type: "create"; value: NewModel<T> }
  | { type: "update"; id: string | number; value: NewModel<T> }
  | { type: "delete"; id: string | number };

export interface ListState<T extends ListModel> {
  create(item: NewModel<T>): Id;
  update(id: string | number, item: NewModel<T>): void;
  delete(id: string | number): void;
  items(): ListEntry<T>[];
  ops(): Op<T>[];
  reset(): void;
}

type Operation<T extends ListModel> =
  | {
      type: "create";
      id: Id;
      value: NewModel<T>;
    }
  | {
      type: "update";
      id: string | number;
      value: NewModel<T>;
    }
  | {
      type: "delete";
      id: string | number;
    };

export function createListState<T extends ListModel>(
  items: Accessor<T[]>
): ListState<T> {
  const [ops, setOps] = createSignal<Operation<T>[]>([]);

  createEffect(
    on(
      items,
      (_) => {
        setOps([]);
      },
      { defer: true }
    )
  );

  const outputItem = createMemo(() => {
    const filtered = items()
      .map((m) => {
        const found = ops().find((op) => op.id == m.id);
        const item = {
          id: m.id,
          value: (found as any)?.value ?? m,
          isPersistent: true,
        };
        if (found) {
          return found.type != "delete" ? item : void 0;
        } else {
          return item;
        }
      })
      .filter(Boolean) as ListEntry<T>[];

    filtered.push(
      ...ops()
        .filter((m) => m.type == "create")
        .map((m) => ({
          id: m.id,
          value: (m as any).value,
          isPersistent: false,
        }))
    );

    return filtered;
  });

  return {
    create(item) {
      const id = createUniqueId();
      setOps((ops) => [...ops, { type: "create", id, value: item }]);

      return id;
    },
    update(id, item) {
      const foundInItems = items().find((m) => m.id == id);

      const op = {
        type: foundInItems ? "update" : "create",
        id,
        value: item,
      } as Operation<T>;

      const foundInOps = ops().findIndex((m) => m.id == id);
      if (!!~foundInOps) {
        const list = ops().slice();
        list[foundInOps] = op;
        setOps(list);
      } else {
        setOps((ops) => [...ops.filter((m) => m.id != id), op]);
      }
    },
    delete(id) {
      const foundInItems = items().find((m) => m.id == id);
      if (foundInItems) {
        setOps((ops) => [
          ...ops.filter((m) => m.id != id),
          { type: "delete", id },
        ]);
      } else {
        setOps((ops) => ops.filter((m) => m.id != id));
      }
    },
    reset() {
      setOps([]);
    },
    items: outputItem,
    ops() {
      return ops();
    },
  };
}

export function createListState2<T extends ListModel>(
  items: Accessor<T[]>
): ListState<T> {
  const [store, setStore] = createStore<{
    ops: (Operation<T> & { value?: NewModel<T> })[];
    items: ListEntry<T>[];
    idsInItems: Set<string | number>;
  }>({
    ops: [],
    items: [],
    idsInItems: new Set(),
  });

  function setItems(items: T[]) {
    setStore(
      "items",
      items.map((item) => ({
        id: item.id,
        value: item,
        isPersistent: true,
      }))
    );

    setStore("idsInItems", new Set(items.map((m) => m.id)));
  }

  createEffect(
    on(items, (items) => {
      setStore("ops", []);
      setItems(items);
    })
  );

  createEffect(() => {
    const removed = store.ops
      .filter((m) => m.type === "delete")
      .map((m) => m.id);

    const ids = untrack(() => store.idsInItems);

    const updated = store.ops.filter((m) => m.type == "update");
    const created = store.ops
      .filter((m) => m.type == "create" && !ids.has(m.id))
      .map((m) => ({
        id: m.id,
        value: (m as any).value,
        isPersistent: false,
      }));

    setStore("items", (items) => {
      return [...items.filter((m) => !removed.includes(m.id)), ...created];
    });

    for (const i of removed) {
      ids.delete(i);
    }

    for (const i of created) {
      ids.add(i.id);
    }

    for (const update of updated) {
      setStore(
        "items",
        (item) => item.id == update.id,
        "value",
        () => (update as any).value
      );
    }
  });

  return {
    create(item) {
      const id = createUniqueId();
      setStore("ops", (ops) => [...ops, { type: "create", id, value: item }]);

      return id;
    },
    update(id, item) {
      const foundInItems = untrack(items).find((m) => m.id == id);

      const op = {
        type: foundInItems ? "update" : "create",
        id,
        value: item,
      } as Operation<T>;

      const ops = untrack(() => store.ops);

      const foundInOps = ops.findIndex((m) => m.id == id);
      if (!!~foundInOps) {
        setStore("ops", foundInOps, "value", item);
        if (foundInItems) {
          setStore("items", (item) => item.id == id, "value", item);
        }
      } else {
        setStore("ops", (ops) => [...ops.filter((m) => m.id != id), op]);
      }
    },
    delete(id) {
      const foundInItems = untrack(items).find((m) => m.id == id);
      if (foundInItems) {
        setStore("ops", (ops) => [
          ...ops.filter((m) => m.id != id),
          { type: "delete", id },
        ]);
      } else {
        batch(() => {
          setStore("ops", (ops) => ops.filter((m) => m.id != id));
          setStore("items", (items) => items.filter((m) => m.id != id) as any);
        });
      }
    },
    reset() {
      batch(() => {
        setStore({
          items: [],
          ops: [],
        });
        setItems(untrack(items));
      });
    },
    ops() {
      return store.ops;
    },
    items() {
      return store.items;
    },
  };
}
