import * as yup from "yup";

/** URL query parameter for free-text search; matches DummyJSON's `q`. */
export const SEARCH_PARAM = "q";
export const MAX_SEARCH_LENGTH = 100;

const searchQuerySchema = yup.string().trim().max(MAX_SEARCH_LENGTH).default("");

/**
 * Normalises a raw search value (URL param, input value) into a trimmed
 * string. Anything invalid becomes an empty query.
 */
export function parseSearchQuery(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value;
  try {
    return searchQuerySchema.validateSync(
      typeof raw === "string" ? raw : undefined,
    );
  } catch {
    return "";
  }
}
