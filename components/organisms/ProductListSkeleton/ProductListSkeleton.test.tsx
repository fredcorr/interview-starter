import { render, screen } from "@testing-library/react";
import { ProductListSkeleton } from "./ProductListSkeleton";

describe("ProductListSkeleton", () => {
  it("announces loading and renders one placeholder per item", () => {
    render(<ProductListSkeleton count={3} />);

    expect(
      screen.getByRole("status", { name: "Loading products" }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("product-card-skeleton")).toHaveLength(3);
  });
});
