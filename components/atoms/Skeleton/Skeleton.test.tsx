import { render, screen } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders a decorative placeholder hidden from assistive tech", () => {
    render(<Skeleton />);

    expect(screen.getByTestId("skeleton")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("takes its size from className and respects reduced motion", () => {
    render(<Skeleton className="h-4 w-24" />);

    expect(screen.getByTestId("skeleton")).toHaveClass(
      "h-4",
      "w-24",
      "animate-pulse",
      "motion-reduce:animate-none",
    );
  });
});
