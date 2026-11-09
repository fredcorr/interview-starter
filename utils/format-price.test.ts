import { formatPrice } from "./format-price";

describe("formatPrice", () => {
  it("formats as US dollars with two decimals", () => {
    expect(formatPrice(9.99)).toBe("$9.99");
    expect(formatPrice(1299)).toBe("$1,299.00");
  });
});
