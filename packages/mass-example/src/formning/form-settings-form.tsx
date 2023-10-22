import { ValidationEvent, createFormApi } from "@mass/form";
import { createRenderEffect } from "solid-js";

export interface Settings {
  submitOnError: boolean;
  validateOnMount: boolean;
  validateEvent: ValidationEvent;
}

export interface FormSettingsFormProps {
  onChange?: (value: Settings) => void;
}

export function FormSettingsForm(props: FormSettingsFormProps) {
  const { control, ...api } = createFormApi<Settings>({
    defaultValues: {
      submitOnError: false,
      validateOnMount: false,
      validateEvent: "submit",
    },
  });

  createRenderEffect(() => {
    props.onChange?.(api.values() as Settings);
  });

  return (
    <form>
      <div>
        <label>
          <input use:control type="checkbox" name="submitOnError" />
          Submit on error
        </label>
      </div>
      <div>
        <label>
          <input use:control type="checkbox" name="validateOnMount" />
          Validate on mount
        </label>
      </div>
      <div>
        <label>Validation event</label>
        <select use:control name="validateEvent">
          <option value="submit">Submit</option>
          <option value="change">Change</option>
          <option value="input">Input</option>
        </select>
      </div>
    </form>
  );
}