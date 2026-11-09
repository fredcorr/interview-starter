import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";

describe("Input", () => {
  it("renders with its label and accepts typing", async () => {
    const onChange = jest.fn();
    render(
      <label>
        Name
        <Input onChange={onChange} />
      </label>,
    );

    await userEvent.type(screen.getByRole("textbox", { name: "Name" }), "Al");

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("merges custom classes", () => {
    render(<Input aria-label="Name" className="pl-10" />);

    expect(screen.getByRole("textbox", { name: "Name" })).toHaveClass(
      "pl-10",
      "rounded-md",
    );
  });
});
