import {
  type Accessor,
  For,
  type JSX,
  createEffect,
  createMemo,
  createSelector,
  createSignal,
  on,
  untrack,
} from "solid-js";

export interface Options<T extends unknown[]> {
  items: Accessor<T>;
  onChange?: (item: T[number], idx: number) => void;
}

export interface HeaderItemProps<T extends unknown[]> {
  item: T[number];
  active: Accessor<boolean>;
  setActive: () => void;
  index: Accessor<number>;
}

export interface ContainerProps<T extends unknown[]> {
  children: (item: T[number]) => JSX.Element;
}

export interface HeaderProps<T extends unknown[]> {
  children: (props: HeaderItemProps<T>) => JSX.Element;
}

export function createTabbingContainer<T extends unknown[]>(
  options: Options<T>
) {
  const [idx, setIdx] = createSignal(0);

  const selector = createSelector(() => options.items()[idx()]);

  const currentChild = createMemo(() => {
    return options.items()[idx()];
  });

  createEffect(
    on(
      idx,
      (idx) => {
        options.onChange?.(options.items()[idx], idx);
      },
      { defer: true }
    )
  );

  return {
    Header: (props: HeaderProps<T>) => {
      return (
        <For each={options.items()}>
          {(item, index) =>
            props.children({
              item,
              active: () => selector(item),
              setActive: () => setIdx(index()),
              index,
            })
          }
        </For>
      );
    },
    Content: (props: ContainerProps<T>) => {
      return <>{props.children(currentChild())}</>;
    },
    active(idx: number) {
      const len = untrack(options.items).length;
      setIdx(idx % len);
    },
  };
}
