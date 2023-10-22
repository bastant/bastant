import { For, ParentProps, Show, createEffect, createSignal } from "solid-js";
import { FormSettingsForm, Settings } from "./form-settings-form";
import {
  FieldApi,
  createForm,
  createFormApi,
  max,
  min,
  required,
  FormState,
} from "@mass/form";
import { Trans, useFixedTFunc } from "@mass/i18n";

export default function Page() {
  const [settings, setSettings] = createSignal<Settings>();

  const t = useFixedTFunc(null, () => "formning");

  const api = createFormApi<{ name: string; age: number }>({
    validations: {
      name: [required(), min(2), max(100)],
      age: [required(), min(18), max(150)],
    },
    submitOnError: () => settings()?.submitOnError ?? false,
    validateEvent: () => settings()?.validateEvent ?? "change",
    submit(value) {
      console.log("value", value);
    },
  });

  const name = api.field("name"),
    age = api.field("age");

  return (
    <div>
      <FormSettingsForm onChange={setSettings} />
      <FormState form={api} />

      <button onClick={api.clearErrors}>Clear errors</button>
      <div>
        <div>Form State: {api.status()}</div>
        <div>Dirty: {api.isDirty() ? t("yes") : t("no")}</div>
      </div>
      <form onSubmit={api.submit}>
        <Field field={name} label={t("name.label", "Name")}>
          <input ref={name.control} />
        </Field>
        <Field field={age} label={t("age.label", "Age")}>
          <input type="number" ref={age.control} />
        </Field>
        <button type="submit">
          <Trans key="submit">Submit</Trans>
        </button>
      </form>
    </div>
  );
}

export interface FieldProps<T> {
  field?: FieldApi<T>;
  label?: string;
}

export function Field<T>(props: ParentProps<FieldProps<T>>) {
  return (
    <div>
      <Show when={props.label}>
        <label>{props.label}</label>
      </Show>
      {props.children}
      <Show when={props.field?.errors()}>
        {(errors) => <For each={errors()}>{(item) => <div>{item}</div>}</For>}
      </Show>
    </div>
  );
}
