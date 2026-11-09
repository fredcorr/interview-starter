import { render, screen } from "@testing-library/react";
import type { FieldConfig } from "@/types/form";
import { FormField } from "./FormField";

const email: FieldConfig = {
  type: "email",
  name: "email",
  label: "Email address",
  hint: "We'll send your quote here.",
  autoComplete: "email",
};

describe("FormField", () => {
  it("renders a required, labelled control described by its hint", () => {
    render(<FormField id="quote-email" field={email} />);

    const input = screen.getByRole("textbox", { name: "Email address" });
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toBeRequired();
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).toHaveAccessibleDescription("We'll send your quote here.");
  });

  it("binds its error message to the control", () => {
    render(
      <FormField id="quote-email" field={email} error="Enter email address" />,
    );

    const input = screen.getByRole("textbox", { name: "Email address" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "We'll send your quote here. Error: Enter email address",
    );
  });

  it("marks optional fields in the label and doesn't require them", () => {
    render(
      <FormField
        id="quote-notes"
        field={{ type: "textarea", name: "notes", label: "Notes", optional: true }}
      />,
    );

    expect(
      screen.getByRole("textbox", { name: "Notes (optional)" }),
    ).not.toBeRequired();
  });

  it("passes number limits to the native input", () => {
    render(
      <FormField
        id="q"
        field={{ type: "number", name: "quantity", label: "Quantity", min: 1, max: 100, integer: true }}
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "100");
    expect(input).toHaveAttribute("step", "1");
  });

  it("disables dates before the earliest allowed date in the native picker", () => {
    jest.useFakeTimers({ now: new Date(2026, 10, 9, 12) });
    const { container } = render(
      <FormField
        id="d"
        field={{ type: "date", name: "deliveryDate", label: "Delivery date", minDaysFromToday: 2 }}
      />,
    );
    jest.useRealTimers();

    const input = container.querySelector("input[type=date]");
    expect(input).toHaveAttribute("min", "2026-11-11");
    expect(screen.getByLabelText("Delivery date")).toBe(input);
  });

  it("renders select fields as a native select", () => {
    render(
      <FormField
        id="s"
        field={{ type: "select", name: "size", label: "Size", options: [{ value: "s", label: "Small" }] }}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Size" })).toBeRequired();
  });

  it("renders hidden fields as a bare, pre-filled hidden input", () => {
    const { container } = render(
      <FormField
        id="p"
        field={{ type: "hidden", name: "productId", label: "Product" }}
        defaultValue="42"
      />,
    );

    expect(screen.queryByText("Product")).not.toBeInTheDocument();
    expect(container.querySelector("input[type=hidden]")).toHaveValue("42");
  });
});
