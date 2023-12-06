import type { Accessor } from "solid-js";
import {
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  on,
} from "solid-js";

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
