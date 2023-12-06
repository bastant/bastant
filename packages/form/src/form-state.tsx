import { Show } from "solid-js";
import { FormApi } from "./form.js";

export interface FormStateProps<T> {
  form?: FormApi<T>;
}

export function FormState<T>(props: FormStateProps<T>) {
  return (
    <div>
      <div>Form State</div>
      <Show when={!!props.form}>
        <div>
          <div>
            <span>{props.form?.status()}</span>
            {props.form?.isDirty() && <span>dirty</span>}
            <span>Valid {props.form?.isValid() ? "true" : "false"}</span>
          </div>
          <code>
            <pre>{JSON.stringify(props.form?.values(), null, 2)}</pre>
          </code>
        </div>
      </Show>
    </div>
  );
}
