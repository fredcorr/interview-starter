import { render, screen } from "@testing-library/react";
import { StarRating } from "./StarRating";

describe("StarRating", () => {
  it("exposes the rating as an accessible image label", () => {
    render(<StarRating rating={4.5} />);

    expect(
      screen.getByRole("img", { name: "Rated 4.5 out of 5" }),
    ).toBeInTheDocument();
  });

  it("fills stars proportionally to the rating", () => {
    render(<StarRating rating={4.5} />);

    expect(screen.getByTestId("star-rating-fill")).toHaveStyle({
      width: "90%",
    });
  });

  it("clamps values outside 0-5", () => {
    render(<StarRating rating={7} />);

    expect(
      screen.getByRole("img", { name: "Rated 5.0 out of 5" }),
    ).toBeInTheDocument();
  });
});
