import {
  createField,
  createForm,
  createFormApi,
  required,
  min,
  FieldApi,
} from "@bastant/form";
import { Fixed, Trans, useFixedTFunc, useTFunc } from "@bastant/i18n";
import {
  For,
  Show,
  createComputed,
  createEffect,
  createSignal,
  mergeProps,
  untrack,
} from "solid-js";

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export default function Page() {
  return (
    <Fixed ns="forms">
      <div>
        <section>
          <h2>
            <Trans key="header.field">Field</Trans>
          </h2>
          <Field />
        </section>
        <section>
          <h2>
            <Trans key="header.form">Form</Trans>
          </h2>
          <Form />
        </section>
      </div>
    </Fixed>
  );
}

function Field() {
  const api = createField<string>({
    validateEvent: "input",
    validators: [required()],
  });

  createEffect(() => {
    console.log("value", api.value());
    //api.validate();
  });

  return (
    <div>
      <TestInput />
      <Show when={api.errors()}>
        {(errors) => (
          <div>
            <For each={errors()}>{(item) => <div>{item}</div>}</For>
          </div>
        )}
      </Show>
    </div>
  );
}

function Form() {
  const [defaultValues, setValues] = createSignal({
    name: "Hello",
    age: 14,
    description: "",
  });

  const {
    control,
    field,
    values,
    reset,
    clear,
    Field,
    submit,
    validate,
    isSubmitting,
    isValidating,
    isDirty,
  } = createForm({
    defaultValues,
    //validateEvent: "change",
    submitOnError: false,
    validations: {
      name: [required()],
      age: [
        min(10),
        {
          name: "sometinhg",
          message: "Waiting",
          async validate(value: unknown) {
            await delay(1000);
            return true;
          },
        },
      ],
    },
    async submit(value) {
      await delay(4000);
      console.log("submit!", value);
      setValues(value as any);
    },
  });

  createEffect(() => {
    console.log(values());
    //validate();
  });

  const t = useFixedTFunc(null, () => "translation");

  return (
    <Fixed ns="forms" keyPrefix="form">
      <form onSubmit={submit}>
        <h5>
          Form Status:{" "}
          {(() => {
            if (isSubmitting()) {
              return "submittinhg";
            } else if (isValidating()) {
              return "validating";
            } else {
              return "editing";
            }
          })()}
          , <Trans key="status.dirty.text">Dirty</Trans>:{" "}
          {isDirty() ? t()("yes") : t()("no")}
        </h5>
        <div>
          <label>Name</label>
          <input name="name" use:control />
          <Show when={field("name").errors()}>
            {(errors) => (
              <For each={errors()}>{(item) => <div>{item}</div>}</For>
            )}
          </Show>
        </div>
        <Field name="age">
          {({ field, name }) => (
            <input
              type="number"
              name={name()}
              value={field.value()}
              onBlur={() => field.touch()}
              onInput={(e) => {
                field.setValue(e.target.valueAsNumber);
              }}
            />
          )}
        </Field>
        <Field name="description">
          {({ field }) => <TestInput field={field} />}
        </Field>
        <button
          type="reset"
          onClick={(e) => {
            e.preventDefault();
            reset();
          }}
        >
          Reset
        </button>
        <button type="submit">Submit</button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            clear();
          }}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={(e) => {
            setValues({ name: "Rasmus", age: 39, description: "" });
          }}
        >
          New defaults
        </button>
      </form>
    </Fixed>
  );
}

function TestInput(props: { field?: FieldApi<string> }) {
  const local = mergeProps(
    {
      field: createField<string>({
        validators: [required()],
        validateEvent: "input",
      }),
    },
    props
  );

  return (
    <input
      type="text"
      onBlur={() => local.field.touch()}
      value={local.field.value() ?? ""}
      onInput={(e) => local.field.setValue(e.target.value)}
    />
  );
}
