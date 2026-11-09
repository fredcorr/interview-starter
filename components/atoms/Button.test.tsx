import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its label and handles clicks", async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("merges custom classes", () => {
    render(<Button className="w-full">Save</Button>);

    expect(screen.getByRole("button")).toHaveClass("w-full", "bg-primary");
  });

  it("stays focusable but ignores clicks while loading", async () => {
    const onClick = jest.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });
    await userEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
  });
});
