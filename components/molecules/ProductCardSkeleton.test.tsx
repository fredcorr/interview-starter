import { render, screen } from "@testing-library/react";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

describe("ProductCardSkeleton", () => {
  it("renders a placeholder hidden from assistive tech", () => {
    render(<ProductCardSkeleton />);

    expect(screen.getByTestId("product-card-skeleton")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
