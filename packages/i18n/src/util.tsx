import type { IDom } from "html-parse-string";
import type {
  i18n,
  TFunction,
  InitOptions,
  InterpolationOptions,
  TOptions,
} from "i18next";
import type { ParentProps } from "solid-js";

import { parse } from "html-parse-string";

const isNode = !globalThis.window;

function hasInterpolation(
  value: string,
  { prefix = "{{", suffix = "}}" }: InterpolationOptions
) {
  return value.includes(prefix) && value.includes(suffix);
}

function replaceElements(ast: IDom, { interpolation }: InitOptions) {
  return (child: Node, index: number) => {
    if (typeof child === "string") {
      if (hasInterpolation(child, interpolation ?? {}))
        return ast.children[index].children?.[0].content;

      return ast.children[index].content;
    }

    child.textContent = ast.children[index].children?.[0].content ?? "";

    return child;
  };
}

export function translateJSX(
  {
    i18n: { options },
    t,
    props,
  }: {
    t: TFunction;
    props: ParentProps<{ key: string; options?: TOptions }>;
    i18n: i18n;
  },
  children: Node[]
) {
  const translation = t(props.key, props.options);

  if (!props.children) return translation;

  if (translation === props.key)
    return children.map(translateWithInterpolation(t, options, props));

  try {
    const [ast] = parse(`<0>${translation}</0>`);
    return children.map(replaceElements(ast, options));
  } catch {
    console.error(
      "In order to use JSX nesting, install %chtml-parse-string",
      "font-weight: 700",
      "https://github.com/ryansolid/html-parse-string."
    );
  }
}

function translateWithInterpolation(
  t: TFunction,
  options: InitOptions,
  props: { key: string; options?: TOptions }
) {
  return (item: any) => {
    const type = typeof item;

    if (
      type === "string" &&
      hasInterpolation(item as string, options.interpolation ?? {})
    )
      return t(item as string, props.options);

    if (type === "object") {
      const textContent = item.textContent ?? item.t;
      if (
        textContent &&
        hasInterpolation(textContent, options.interpolation ?? {})
      ) {
        item[isNode ? "t" : "textContent"] = t(textContent, props.options);
      }
    }

    return item;
  };
}
