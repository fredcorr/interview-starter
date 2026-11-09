import { render, screen } from "@testing-library/react";
import { Icon } from "./Icon";

describe("Icon", () => {
  it("is hidden from assistive tech when decorative", () => {
    const { container } = render(<Icon name="search" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("data-icon", "search");
  });

  it("is exposed as an image when given a label", () => {
    render(<Icon name="close" label="Close" />);

    expect(screen.getByRole("img", { name: "Close" })).toBeInTheDocument();
  });

  it("merges custom classes", () => {
    const { container } = render(<Icon name="star" className="size-4" />);

    expect(container.querySelector("svg")).toHaveClass(
      "size-4",
      "fill-current",
    );
  });
});
