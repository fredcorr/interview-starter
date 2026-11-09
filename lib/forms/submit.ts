import "server-only";
import { logger } from "@/lib/logger";
import type { FieldConfig, FormActionState, RawValues } from "@/types/form";
import { readValues } from "./form-data";
import { getFormFields } from "./registry";
import { validateForm } from "./validate";

/** Every form posts here; the payload's `formId` says which form it is. */
export const FORMS_ENDPOINT = "https://dummyjson.com/http/200";

const SUBMIT_TIMEOUT_MS = 10_000;
const MAX_LOGGED_LENGTH = 64;

/**
 * Hidden fields carry system values (e.g. a product id), so they're logged to
 * trace a submission. Values the user typed are never logged.
 */
const hiddenValues = (fields: readonly FieldConfig[], values: RawValues) =>
  Object.fromEntries(
    fields
      .filter((field) => field.type === "hidden")
      .map(({ name }) => [name, values[name]?.slice(0, MAX_LOGGED_LENGTH)]),
  );

export interface SubmitOptions {
  now?: Date;
}

export const submitForm = async (
  formId: string,
  formData: FormData,
  { now }: SubmitOptions = {},
): Promise<FormActionState> => {
  const requestId = crypto.randomUUID();
  const fields = getFormFields(formId);
  if (!fields) {
    logger.warn("form.unknown_id", { formId, requestId });
    return { status: "error", requestId };
  }

  const raw = readValues(fields, formData);
  const trace = { formId, requestId, ...hiddenValues(fields, raw) };
  const result = validateForm(fields, raw, { server: true, now });
  if (!result.ok) {
    logger.warn("form.validation_failed", {
      ...trace,
      failedRules: result.failedRules,
    });
    return { status: "error", requestId, fieldErrors: result.fieldErrors };
  }

  try {
    const response = await fetch(FORMS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formId, values: result.values }),
      signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
    });
    if (!response.ok) {
      logger.error("form.submit_failed", { ...trace, status: response.status });
      return { status: "error", requestId };
    }
  } catch (error) {
    logger.error("form.submit_failed", {
      ...trace,
      error: error instanceof Error ? error.message : String(error),
    });
    return { status: "error", requestId };
  }

  logger.info("form.submitted", trace);
  return { status: "success", requestId };
};
