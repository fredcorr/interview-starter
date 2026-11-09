import { ValidationError } from "yup";
import type {
  FieldConfig,
  FieldErrors,
  FieldRule,
  FormValues,
  RawValues,
} from "@/types/form";
import { buildSchema, toRule, type SchemaOptions } from "./schema";

export type ValidationResult<F extends readonly FieldConfig[]> =
  | { ok: true; values: FormValues<F> }
  | {
      ok: false;
      fieldErrors: FieldErrors;
      /** Which rule each field failed, for logging without user values. */
      failedRules: Record<string, FieldRule>;
    };

/** Validates every field of a form. Shared by the client and the server. */
export const validateForm = <F extends readonly FieldConfig[]>(
  fields: F,
  values: RawValues,
  options: SchemaOptions = {},
): ValidationResult<F> => {
  try {
    const parsed = buildSchema(fields, options).validateSync(values, {
      abortEarly: false,
      // Anything posted that isn't a field of this form is discarded.
      stripUnknown: true,
    });
    return { ok: true, values: parsed as FormValues<F> };
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error;
    const fieldErrors: FieldErrors = {};
    const failedRules: Record<string, FieldRule> = {};
    for (const issue of error.inner) {
      if (!issue.path || issue.path in fieldErrors) continue;
      fieldErrors[issue.path] = issue.message;
      failedRules[issue.path] = toRule(issue.type);
    }
    return { ok: false, fieldErrors, failedRules };
  }
};

/** Validates one field, for feedback while the user moves through the form. */
export const validateField = (
  fields: readonly FieldConfig[],
  name: string,
  values: RawValues,
  options: SchemaOptions = {},
): string | undefined => {
  try {
    buildSchema(fields, options).validateSyncAt(name, values);
    return undefined;
  } catch (error) {
    if (error instanceof ValidationError) return error.message;
    throw error;
  }
};
