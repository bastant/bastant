import type { TOptions } from "i18next";
import type { ParentComponent, ParentProps } from "solid-js";
import { children } from "solid-js";
import { translateJSX } from "./util.jsx";
import { useFixedTFunc, useI18n, useTFunc } from "./provider.jsx";

export type TransProps = { key: string; options?: TOptions };

export const Trans: ParentComponent<TransProps> = (props) => {
  const t = useTFunc();
  const instance = useI18n();

  return (
    <>
      {typeof props.children === "string"
        ? t(props.key, props.children, props.options)
        : translateJSX(
            { i18n: instance(), t, props },
            children(() => props.children)() as Node[]
          )}
    </>
  );
};

export type TransFixedProps<
  NS extends string,
  KP extends string
> = TransProps & {
  ns?: NS;
  keyPrefix?: KP;
};

export function TransFixed<N extends string, K extends string>(
  props: ParentProps<TransFixedProps<N, K>>
) {
  const t = useFixedTFunc<N, K>(
    null,
    () => props.ns,
    () => props.keyPrefix
  );
  const instance = useI18n();

  return (
    <>
      {typeof props.children === "string"
        ? t(props.key, props.children, props.options)
        : translateJSX(
            { i18n: instance(), t, props },
            children(() => props.children)() as Node[]
          )}
    </>
  );
}
