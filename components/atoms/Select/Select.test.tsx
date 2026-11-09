import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "./Select";

const options = [
  { value: "s", label: "Small" },
  { value: "l", label: "Large" },
];

describe("Select", () => {
  it("renders a native select with a placeholder and the given options", async () => {
    render(<Select aria-label="Size" options={options} defaultValue="" />);
    const select = screen.getByRole("combobox", { name: "Size" });

    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Select an option",
      "Small",
      "Large",
    ]);

    await userEvent.selectOptions(select, "Large");
    expect(select).toHaveValue("l");
  });
});
