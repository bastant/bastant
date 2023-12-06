import {
  For,
  Index,
  ParentProps,
  Show,
  createEffect,
  createSignal,
} from "solid-js";
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
import { DynamicShow } from "@bastant/base";
import { FileInput, UploadButton, file, mime } from "@bastant/fileupload";

export default function Page() {
  const [settings, setSettings] = createSignal<Settings>();
  const [defaults, setDefaults] = createSignal<{
    name: string;
    age: number;
    file?: File;
  }>();

  const t = useFixedTFunc(null, () => "formning");

  const api = v2.createForm<{ name: string; age: number; file?: File }>({
    defaultValues: defaults,
    validations: {
      name: [required(), min(2), max(100)],
      age: [required(), min(18), max(150)],
      file: [file(), mime(["image/png", "text/plain"]), max(1 << 10)],
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
    age = api.field("age"),
    fileField = api.field("file");

  v2.useSubmitHook(age, (v) => {
    console.log("before submit", v);
    return true;
  });

  return (
    <div>
      <FormSettingsForm onChange={setSettings} />
      {/* <FormState form={api} /> */}
      <Show when={api.submitError()}>
        <div>Submit failed: {api.submitError()?.message}</div>
      </Show>
      <button onClick={api.clearErrors}>Clear errors</button>
      <button
        onClick={() =>
          setDefaults((v) =>
            v
              ? void 0
              : {
                  name: "The Main",
                  age: 42,
                  file: new File(["Hello, World!"], "hello.txt", {
                    type: "text/plain",
                  }),
                }
          )
        }
      >
        Set defaults
      </button>
      <button
        onClick={(e) => {
          api.clear();
        }}
      >
        Clear
      </button>
      <button onClick={(e) => api.validate()}>Validate</button>
      <form
        onSubmit={api.submit}
        onReset={(e) => {
          e.preventDefault();
          api.reset();
        }}
      >
        <Field field={name} label={t("name.label", "Name")}>
          <input ref={name.control} />
        </Field>
        <Field field={age} label={t("age.label", "Age")}>
          <input type="number" ref={age.control} />
        </Field>
        <Field field={fileField} label={t("file.label", "File")}>
          <UploadButton
            value={fileField.value()}
            onChange={fileField.setValue}
          />
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
      <DynamicShow
        show={!!props.field?.errors()?.length}
        enter={[{ opacity: 1 }]}
        leave={[{ opacity: 0 }]}
        duration={300}
      >
        <Index each={props.field?.errors()}>
          {(item) => <div>{item()}</div>}
        </Index>
      </DynamicShow>
    </div>
  );
}
