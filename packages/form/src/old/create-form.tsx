import { Dynamic } from "solid-js/web";
import {
  type JSX,
  type Accessor,
  splitProps,
  mergeProps,
  For,
  createMemo,
  Show,
} from "solid-js";
import { FormApi, FormOptions, createFormApi } from "./form-api.js";
import { Validation } from "./validate.js";
import { FieldApi } from "./field.jsx";

export type AsProps<K extends keyof JSX.HTMLElementTags = "span"> = {
  as?: K;
} & Omit<JSX.HTMLElementTags[K], "children">;

export type FieldProps<
  T,
  K extends keyof T,
  A extends keyof JSX.HTMLElementTags = "span"
> = AsProps<A> & {
  name: K;
  renderError?: boolean;
  errorClass?: string;
  validations?: Validation[];
  children: (props: {
    field: FieldApi<T[K]>;
    name: Accessor<K>;
    error: () => string[] | undefined;
  }) => JSX.Element;
};

export interface Form<T> extends FormApi<T> {
  Field<K extends keyof T>(props: FieldProps<T, K>): JSX.Element;
}
export function createForm<T>(options: FormOptions<T> = {}): Form<T> {
  const api = createFormApi<T>(options);

  function Field<
    V extends keyof T,
    A extends keyof JSX.HTMLElementTags = "span"
  >(props: FieldProps<T, V, A>) {
    const [local, dynamic] = splitProps(
      mergeProps(
        {
          renderError: true,
        },
        props
      ),
      ["name", "renderError", "errorClass", "children", "as", "validations"]
    );

    const field = createMemo(() => api.field(local.name));

    return (
      <Dynamic component={local.as ?? "div"} {...(dynamic as any)}>
        {props.children({
          field: field() as unknown as FieldApi<T[V]>,
          name: () => local.name,
          error: field().errors,
        })}
        {(props.renderError ?? true) && field().errors() && (
          <Show when={field().errors()}>
            {(errors) => (
              <div class={local.errorClass}>
                <For each={errors()}>{(item) => <div>{item}</div>}</For>
              </div>
            )}
          </Show>
        )}
      </Dynamic>
    );
  }

  return {
    ...api,
    Field,
  };
}
