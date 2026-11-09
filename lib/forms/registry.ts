import "server-only";
import type { FieldConfig } from "@/types/form";
import { quoteFields } from "./quote";

/**
 * Every form the server accepts. The server validates against these fields,
 * never against anything the client sends about the form.
 */
const FORMS = {
  quote: quoteFields,
} satisfies Record<string, readonly FieldConfig[]>;

export type FormId = keyof typeof FORMS;

export const isFormId = (id: string): id is FormId => Object.hasOwn(FORMS, id);

export const getFormFields = (id: string): readonly FieldConfig[] | undefined =>
  isFormId(id) ? FORMS[id] : undefined;
