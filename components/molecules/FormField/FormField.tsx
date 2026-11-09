import type { FocusEventHandler, FormEventHandler } from "react";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { getMinDate } from "@/lib/forms/dates";
import type { FieldConfig } from "@/types/form";

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export interface FormFieldProps {
  field: FieldConfig;
  /** Element id; the error summary links to it. */
  id: string;
  error?: string;
  defaultValue?: string;
  onBlur?: FocusEventHandler<Control>;
  onChange?: FormEventHandler<Control>;
}

/** Native attributes that mirror the field's validation rules. */
const nativeAttributes = (field: FieldConfig) => {
  switch (field.type) {
    case "number":
      return {
        type: "number",
        inputMode: field.integer ? ("numeric" as const) : ("decimal" as const),
        min: field.min,
        max: field.max,
        step: field.integer ? 1 : "any",
      };
    case "date":
      return {
        type: "date",
        min:
          field.minDaysFromToday === undefined
            ? undefined
            : getMinDate(field.minDaysFromToday),
      };
    case "email":
      return { type: "email", maxLength: field.maxLength };
    case "text":
      return { type: "text", maxLength: field.maxLength, pattern: field.pattern };
    default:
      return {};
  }
};

/**
 * One form row: label, the control for the field's type, hint and error.
 * The control is described by its hint and error, so screen readers read both.
 */
export const FormField = ({
  field,
  id,
  error,
  defaultValue,
  onBlur,
  onChange,
}: FormFieldProps) => {
  if (field.type === "hidden") {
    return <input type="hidden" name={field.name} defaultValue={defaultValue} />;
  }

  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const optional = field.optional === true;
  const describedBy =
    [field.hint && hintId, error && errorId].filter(Boolean).join(" ") ||
    undefined;

  const shared = {
    id,
    name: field.name,
    defaultValue,
    required: !optional,
    autoComplete: field.autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    onBlur,
    onChange,
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} optional={optional}>
        {field.label}
      </Label>
      {field.hint && (
        <p id={hintId} className="text-sm text-muted">
          {field.hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-danger">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
      {field.type === "textarea" ? (
        <Textarea maxLength={field.maxLength} {...shared} />
      ) : field.type === "select" ? (
        <Select options={field.options} {...shared} />
      ) : (
        <Input {...nativeAttributes(field)} {...shared} />
      )}
    </div>
  );
};
