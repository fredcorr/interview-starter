import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { withModal } from "./withModal";

const Greeting = ({ name }: { name: string }) => (
  <>
    <p>Hello {name}</p>
    <button>Action</button>
  </>
);

const GreetingModal = withModal(Greeting);

const Page = ({ onClose = () => {} }: { onClose?: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open greeting</button>
      <GreetingModal
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        title="Greeting"
        description="A friendly hello"
        name="Ada"
      />
    </>
  );
};

const openModal = async () => {
  const user = userEvent.setup();
  render(<Page />);
  await user.click(screen.getByRole("button", { name: "Open greeting" }));
  return user;
};

describe("withModal", () => {
  it("renders nothing while closed", () => {
    render(<Page />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens a labelled, described dialog around the wrapped component", async () => {
    await openModal();

    const dialog = screen.getByRole("dialog", { name: "Greeting" });
    expect(dialog).toHaveAccessibleDescription("A friendly hello");
    expect(screen.getByText("Hello Ada")).toBeInTheDocument();
  });

  it("moves focus into the dialog and keeps it there", async () => {
    const user = await openModal();

    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Action" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("closes from the close button and returns focus to the opener", async () => {
    const user = await openModal();

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open greeting" })).toHaveFocus();
  });

  it("closes on Escape (the browser fires `cancel`)", async () => {
    await openModal();

    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { cancelable: true }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the backdrop is clicked, not the content", async () => {
    const user = await openModal();

    await user.click(screen.getByText("Hello Ada"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
