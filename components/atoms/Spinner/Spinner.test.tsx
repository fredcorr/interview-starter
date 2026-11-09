import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("is decorative and hidden from assistive tech", () => {
    render(<Spinner className="size-6" />);

    const spinner = screen.getByTestId("spinner");
    expect(spinner).toHaveAttribute("aria-hidden", "true");
    expect(spinner).toHaveClass("size-6", "animate-spin");
  });
});
