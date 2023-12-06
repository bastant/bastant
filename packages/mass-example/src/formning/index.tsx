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
  v2,
} from "@bastant/form";
import { Trans, useFixedTFunc } from "@bastant/i18n";

export default function Page() {
  const [settings, setSettings] = createSignal<Settings>();

  const t = useFixedTFunc(null, () => "formning");

  const api = v2.createForm<{ name: string; age: number }>({
    validations: {
      name: [required(), min(2), max(100)],
      age: [required(), min(18), max(150)],
    },
    submitOnError: () => settings()?.submitOnError ?? false,
    validationEvent: () => settings()?.validateEvent ?? "input",
    submit(value) {
      if (settings()?.triggerSubmitError) {
        throw "Hey, mand";
      }

      console.log("value", value);
    },
  });

  const name = api.field("name"),
    age = api.field("age");

  return (
    <div>
      <FormSettingsForm onChange={setSettings} />
      {/* <FormState form={api} /> */}
      <Show when={api.submitError()}>
        <div>{api.submitError()?.message}</div>
      </Show>
      <button onClick={api.clearErrors}>Clear errors</button>

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
        <button type="reset">
          <Trans key="reset">Reset</Trans>
        </button>
      </form>
    </div>
  );
}

export interface FieldProps<T> {
  field?: v2.FieldApi<T>;
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
