import * as yup from "yup";
import type {
  DateField,
  FieldConfig,
  FieldRule,
  NumberField,
} from "@/types/form";
import { formatIsoDate, getMinDate, isIsoDate, type DateOptions } from "./dates";

export type SchemaOptions = DateOptions;

const lowerFirst = (text: string) =>
  text.charAt(0).toLowerCase() + text.slice(1);

const rangeMessage = ({ label, min, max }: NumberField) => {
  if (min !== undefined && max !== undefined)
    return `${label} must be between ${min} and ${max}`;
  if (min !== undefined) return `${label} must be ${min} or more`;
  return `${label} must be ${max} or fewer`;
};

/** Fields the user picks a value for, rather than types one. */
const isPicked = (field: FieldConfig) =>
  field.type === "date" || field.type === "select";

const generatedMessage = (
  field: FieldConfig,
  rule: FieldRule,
  minDate?: string,
): string => {
  const name = lowerFirst(field.label);
  switch (rule) {
    case "required":
      return isPicked(field) ? `Choose a ${name}` : `Enter ${name}`;
    case "email":
      return "Enter a valid email address, like name@company.com";
    case "maxLength":
      return `${field.label} must be ${"maxLength" in field ? field.maxLength : ""} characters or fewer`;
    case "number":
      return `${field.label} must be a number`;
    case "integer":
      return `${field.label} must be a whole number`;
    case "range":
      return field.type === "number" ? rangeMessage(field) : "";
    case "date":
      return `${field.label} must be a real date`;
    case "pattern":
      return `${field.label} is not in the right format`;
    case "oneOf":
      return `Choose a ${name} from the list`;
    case "minDate":
      return `Choose a ${name} on or after ${minDate ? formatIsoDate(minDate) : ""}`;
    default:
      return `${field.label} is not valid`;
  }
};

export const messageFor = (
  field: FieldConfig,
  rule: FieldRule,
  minDate?: string,
) => field.messages?.[rule] ?? generatedMessage(field, rule, minDate);

/** Same check as the browser's own `type="email"` validation. */
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** Empty or whitespace-only input counts as missing. */
const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

type StringSchema = yup.StringSchema<string | undefined>;

/** Adds a test named after our rule, skipped when the value is empty. */
const withRule = (
  schema: StringSchema,
  rule: FieldRule,
  message: string,
  isValid: (value: string) => boolean,
): StringSchema =>
  schema.test(rule, message, (value) =>
    value === undefined ? true : isValid(value),
  );

const dateRules = (
  schema: StringSchema,
  field: DateField,
  options: SchemaOptions,
) => {
  let next = withRule(schema, "date", messageFor(field, "date"), isIsoDate);
  if (field.minDaysFromToday !== undefined) {
    const minDate = getMinDate(field.minDaysFromToday, options);
    // ISO dates compare correctly as strings.
    next = withRule(next, "minDate", messageFor(field, "minDate", minDate), (v) =>
      isIsoDate(v) ? v >= minDate : true,
    );
  }
  return next;
};

const stringSchema = (
  field: Exclude<FieldConfig, NumberField>,
  options: SchemaOptions,
): StringSchema => {
  let schema: StringSchema = yup
    .string()
    .transform(emptyToUndefined)
    .trim();

  if (field.type === "email") {
    schema = withRule(schema, "email", messageFor(field, "email"), (v) =>
      EMAIL_PATTERN.test(v),
    );
  }
  if (field.type === "date") {
    schema = dateRules(schema, field, options);
  }
  if (field.type === "select") {
    const allowed = new Set(field.options.map((option) => option.value));
    schema = withRule(schema, "oneOf", messageFor(field, "oneOf"), (v) =>
      allowed.has(v),
    );
  }
  if ("pattern" in field && field.pattern !== undefined) {
    // Anchored like the native `pattern` attribute: the whole value must match.
    const pattern = new RegExp(`^(?:${field.pattern})$`);
    schema = withRule(schema, "pattern", messageFor(field, "pattern"), (v) =>
      pattern.test(v),
    );
  }
  if ("maxLength" in field && field.maxLength !== undefined) {
    const { maxLength } = field;
    schema = withRule(schema, "maxLength", messageFor(field, "maxLength"), (v) =>
      v.length <= maxLength,
    );
  }
  return schema;
};

const numberSchema = (field: NumberField) => {
  const { min = -Infinity, max = Infinity, integer = false } = field;
  return yup
    .number()
    .transform((value: number, original: unknown) =>
      emptyToUndefined(original) === undefined ? undefined : value,
    )
    .typeError(messageFor(field, "number"))
    .test("integer", messageFor(field, "integer"), (value) =>
      value === undefined || !integer ? true : Number.isInteger(value),
    )
    .test("range", messageFor(field, "range"), (value) =>
      value === undefined ? true : value >= min && value <= max,
    );
};

const fieldSchema = (
  field: FieldConfig,
  options: SchemaOptions,
): yup.Schema => {
  const schema =
    field.type === "number"
      ? numberSchema(field)
      : stringSchema(field, options);
  const isOptional = "optional" in field && field.optional === true;
  return isOptional
    ? schema.optional()
    : schema.required(messageFor(field, "required"));
};

export const buildSchema = (
  fields: readonly FieldConfig[],
  options: SchemaOptions = {},
) =>
  yup.object(
    Object.fromEntries(
      fields.map((field) => [field.name, fieldSchema(field, options)]),
    ),
  );

const RULES = new Set<string>([
  "required",
  "email",
  "pattern",
  "maxLength",
  "number",
  "integer",
  "range",
  "date",
  "minDate",
  "oneOf",
] satisfies FieldRule[]);

const isRule = (value: string): value is FieldRule => RULES.has(value);

/** Yup's own checks: "optionality" is a missing value, "typeError" a bad cast. */
const YUP_RULES: Record<string, FieldRule> = {
  optionality: "required",
  typeError: "number",
};

export const toRule = (yupType: string | undefined): FieldRule => {
  if (!yupType) return "required";
  return isRule(yupType) ? yupType : (YUP_RULES[yupType] ?? "required");
};
