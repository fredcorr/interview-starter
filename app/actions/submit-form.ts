"use server";

import { submitForm } from "@/lib/forms/submit";
import type { FormActionState } from "@/types/form";

/**
 * The one server action every form submits to. Bind the form id on the client:
 * `submitFormAction.bind(null, "quote")`. The id comes from the client, so
 * `submitForm` looks it up in the server's registry before trusting anything.
 */
export const submitFormAction = async (
  formId: string,
  _previous: FormActionState,
  formData: FormData,
): Promise<FormActionState> => submitForm(String(formId), formData);
