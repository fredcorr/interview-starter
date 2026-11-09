import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders a labelled multi-line field that accepts typing", async () => {
    render(<Textarea aria-label="Notes" />);
    const field = screen.getByRole("textbox", { name: "Notes" });

    await userEvent.type(field, "Hi{enter}there");

    expect(field).toHaveValue("Hi\nthere");
  });

  it("merges custom classes", () => {
    render(<Textarea aria-label="Notes" className="min-h-40" />);

    expect(screen.getByRole("textbox")).toHaveClass("min-h-40", "rounded-md");
  });
});
