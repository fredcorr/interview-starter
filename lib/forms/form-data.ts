import type { FieldConfig, RawValues } from "@/types/form";

/** Reads only the form's own fields out of FormData; files and extras are ignored. */
export const readValues = (
  fields: readonly FieldConfig[],
  formData: FormData,
): RawValues =>
  Object.fromEntries(
    fields.map(({ name }) => {
      const value = formData.get(name);
      return [name, typeof value === "string" ? value : ""];
    }),
  );
