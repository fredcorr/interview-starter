import { render, screen } from "@testing-library/react";
import { Label } from "./Label";

describe("Label", () => {
  it("names its control", () => {
    render(
      <>
        <Label htmlFor="company">Company name</Label>
        <input id="company" />
      </>,
    );

    expect(
      screen.getByRole("textbox", { name: "Company name" }),
    ).toBeInTheDocument();
  });

  it("marks optional fields as optional", () => {
    render(
      <>
        <Label htmlFor="notes" optional>
          Notes
        </Label>
        <input id="notes" />
      </>,
    );

    expect(
      screen.getByRole("textbox", { name: "Notes (optional)" }),
    ).toBeInTheDocument();
  });
});
