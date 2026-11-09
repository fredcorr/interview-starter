import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { SearchBar } from "./SearchBar";

function ControlledSearchBar({ onSubmit }: { onSubmit?: (v: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <SearchBar
      label="Search products"
      value={value}
      onValueChange={setValue}
      onSubmit={onSubmit}
    />
  );
}

describe("SearchBar", () => {
  it("renders a labelled search box inside a search landmark", () => {
    render(<SearchBar label="Search products" value="" />);

    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "Search products" }),
    ).toBeInTheDocument();
  });

  it("is controlled and submits the current value on Enter", async () => {
    const onSubmit = jest.fn();
    render(<ControlledSearchBar onSubmit={onSubmit} />);

    const input = screen.getByRole("searchbox", { name: "Search products" });
    await userEvent.type(input, "phone{Enter}");

    expect(input).toHaveValue("phone");
    expect(onSubmit).toHaveBeenCalledWith("phone");
  });

  it("only shows the pending hint while pending", () => {
    const { rerender } = render(<SearchBar value="" />);
    expect(screen.getByText("Searching…")).toHaveClass("invisible");

    rerender(<SearchBar value="" pending />);
    expect(screen.getByText("Searching…")).not.toHaveClass("invisible");
  });
});
