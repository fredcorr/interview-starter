import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { SearchBar } from "./SearchBar";

const ControlledSearchBar = ({
  onSubmit,
}: {
  onSubmit?: (value: string) => void;
}) => {
  const [value, setValue] = useState("");
  return (
    <SearchBar
      label="Search products"
      value={value}
      onValueChange={setValue}
      onSubmit={onSubmit}
    />
  );
};

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

  it("only shows the clear button when there is text", async () => {
    render(<ControlledSearchBar />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    await userEvent.type(screen.getByRole("searchbox"), "phone");

    expect(
      screen.getByRole("button", { name: "Clear search products" }),
    ).toBeInTheDocument();
  });

  it("clears with the keyboard and returns focus to the field", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<ControlledSearchBar onSubmit={onSubmit} />);

    const input = screen.getByRole("searchbox", { name: "Search products" });
    await user.type(input, "phone");
    await user.tab();
    expect(
      screen.getByRole("button", { name: "Clear search products" }),
    ).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(onSubmit).toHaveBeenLastCalledWith("");
  });
});
