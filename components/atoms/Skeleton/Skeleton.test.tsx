import { render, screen } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

const parts = (name: "media" | "line") =>
  screen.getByTestId("skeleton").querySelectorAll(`[data-skeleton="${name}"]`);

describe("Skeleton", () => {
  it("is decorative and hidden from assistive tech", () => {
    render(<Skeleton />);

    expect(screen.getByTestId("skeleton")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("renders an image block and three lines by default", () => {
    render(<Skeleton />);

    expect(parts("media")).toHaveLength(1);
    expect(parts("media")[0]).toHaveClass("aspect-square");
    expect(parts("line")).toHaveLength(3);
  });

  it("supports other media ratios, no media, and a custom line count", () => {
    const { rerender } = render(<Skeleton media="video" lines={1} />);
    expect(parts("media")[0]).toHaveClass("aspect-video");
    expect(parts("line")).toHaveLength(1);

    rerender(<Skeleton media="none" lines={5} />);
    expect(parts("media")).toHaveLength(0);
    expect(parts("line")).toHaveLength(5);
  });

  it("takes its frame from className and respects reduced motion", () => {
    render(<Skeleton className="rounded-xl border" />);

    expect(screen.getByTestId("skeleton")).toHaveClass(
      "rounded-xl",
      "border",
      "animate-pulse",
      "motion-reduce:animate-none",
    );
  });
});
