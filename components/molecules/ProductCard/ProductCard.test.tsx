import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  mockProduct,
  mockProductWithoutBrand,
} from "@/mocks/molecules/product";
import { ProductCard } from "./ProductCard";

describe("ProductCard", () => {
  it("renders title, brand, price and star rating", () => {
    render(<ProductCard product={mockProduct} />);

    const card = screen.getByRole("article", { name: mockProduct.title });
    expect(card).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: mockProduct.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("Essence")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Rated 4.5 out of 5" }),
    ).toBeInTheDocument();
  });

  it("treats the thumbnail as decorative", () => {
    const { container } = render(<ProductCard product={mockProduct} />);

    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("omits the brand line when there is no brand", () => {
    render(<ProductCard product={mockProductWithoutBrand} />);

    expect(
      screen.getByRole("heading", { name: "Kiwi" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("article").querySelectorAll("p")).toHaveLength(1);
  });

  it("is reachable with the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <>
        <ProductCard product={mockProduct} />
        <ProductCard product={mockProductWithoutBrand} />
      </>,
    );

    await user.tab();
    expect(
      screen.getByRole("article", { name: mockProduct.title }),
    ).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("article", { name: "Kiwi" })).toHaveFocus();
  });
});
