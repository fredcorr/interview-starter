/** Validation rules a field can fail. Used for messages and server logs. */
export type FieldRule =
  | "required"
  | "email"
  | "pattern"
  | "maxLength"
  | "number"
  | "integer"
  | "range"
  | "date"
  | "minDate"
  | "oneOf";

interface BaseField<T extends string> {
  type: T;
  name: string;
  label: string;
  hint?: string;
  /** Fields are required unless marked optional. */
  optional?: boolean;
  /** Override the generated message for any rule. */
  messages?: Partial<Record<FieldRule, string>>;
  autoComplete?: string;
}

export interface TextField extends BaseField<"text" | "textarea"> {
  maxLength?: number;
  /** Regex source, applied to the whole value. Also set as the native attribute. */
  pattern?: string;
}

export interface EmailField extends BaseField<"email"> {
  maxLength?: number;
}

export interface NumberField extends BaseField<"number"> {
  min?: number;
  max?: number;
  integer?: boolean;
}

export interface DateField extends BaseField<"date"> {
  /** Earliest selectable date, counted in days from today. */
  minDaysFromToday?: number;
}

export interface SelectField extends BaseField<"select"> {
  options: readonly { value: string; label: string }[];
}

/** Never rendered to the user; its value is supplied when the form renders. */
export interface HiddenField extends Omit<BaseField<"hidden">, "optional"> {
  pattern?: string;
}

export type FieldConfig =
  | TextField
  | EmailField
  | NumberField
  | DateField
  | SelectField
  | HiddenField;

export type FieldType = FieldConfig["type"];

type FieldValue<F extends FieldConfig> = F extends NumberField
  ? number
  : string;

/** Values a form produces once validated, inferred from its field config. */
export type FormValues<F extends readonly FieldConfig[]> = {
  [K in F[number] as K["name"]]: K extends { optional: true }
    ? FieldValue<K> | undefined
    : FieldValue<K>;
};

/** Every hidden field of a form must be given a value when it renders. */
export type HiddenValues<F extends readonly FieldConfig[]> = {
  [K in Extract<F[number], HiddenField> as K["name"]]: string;
};

/** Raw values as they come out of the form (always strings). */
export type RawValues = Record<string, string>;

export type FieldErrors = Record<string, string>;

export interface FormActionState {
  status: "idle" | "success" | "error";
  /** Correlates a submission with its server log lines. */
  requestId?: string;
  fieldErrors?: FieldErrors;
}
