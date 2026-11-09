import { MAX_SEARCH_LENGTH, parseSearchQuery } from "./search-query";

describe("parseSearchQuery", () => {
  it("trims strings", () => {
    expect(parseSearchQuery("  phone ")).toBe("phone");
  });

  it("takes the first value of a repeated param", () => {
    expect(parseSearchQuery(["laptop", "phone"])).toBe("laptop");
  });

  it("falls back to an empty query", () => {
    expect(parseSearchQuery(undefined)).toBe("");
    expect(parseSearchQuery(null)).toBe("");
    expect(parseSearchQuery("x".repeat(MAX_SEARCH_LENGTH + 1))).toBe("");
  });
});
