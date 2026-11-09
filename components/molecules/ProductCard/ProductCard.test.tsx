import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  mockProduct,
  mockProductWithoutBrand,
} from "@/mocks/molecules/product";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

describe("ProductCard", () => {
  it("renders title, brand, price and star rating", () => {
    render(<ProductCard product={mockProduct} onSelect={jest.fn()} />);

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
    const { container } = render(<ProductCard product={mockProduct} onSelect={jest.fn()} />);

    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("omits the brand line when there is no brand", () => {
    render(
      <ProductCard product={mockProductWithoutBrand} onSelect={jest.fn()} />,
    );

    expect(screen.getByRole("heading", { name: "Kiwi" })).toBeInTheDocument();
    expect(screen.getByRole("article").querySelectorAll("p")).toHaveLength(1);
  });

  it("is one keyboard stop, a button named by the product title", async () => {
    const user = userEvent.setup();
    render(
      <>
        <ProductCard product={mockProduct} onSelect={jest.fn()} />
        <ProductCard product={mockProductWithoutBrand} onSelect={jest.fn()} />
      </>,
    );

    await user.tab();
    expect(
      screen.getByRole("button", { name: mockProduct.title }),
    ).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Kiwi" })).toHaveFocus();
  });

  it("selects the product when the card is clicked or activated", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<ProductCard product={mockProduct} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: mockProduct.title }));
    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenCalledWith(mockProduct);
  });

  it("shows and describes the card's action when given one", () => {
    render(
      <ProductCard
        product={mockProduct}
        onSelect={jest.fn()}
        actionLabel="Request a quote"
      />,
    );

    expect(
      screen.getByRole("button", { name: mockProduct.title }),
    ).toHaveAccessibleDescription("Request a quote");
  });

  describe("ProductCardSkeleton", () => {
    it("renders a placeholder hidden from assistive tech", () => {
      render(<ProductCardSkeleton />);

      const skeleton = screen.getByTestId("skeleton");
      expect(skeleton).toHaveAttribute("aria-hidden", "true");
      expect(skeleton.querySelectorAll('[data-skeleton="line"]')).toHaveLength(
        4,
      );
      expect(screen.queryByRole("article")).not.toBeInTheDocument();
    });
  });
});
