import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { useFocusTrap } from "./use-focus-trap";

const Trap = ({ inertMiddle = false }: { inertMiddle?: boolean }) => {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);

  return (
    <>
      <button onClick={() => setActive(true)}>Open</button>
      {active && (
        <div ref={ref}>
          <button>First</button>
          <div inert={inertMiddle}>
            <button>Middle</button>
          </div>
          <button onClick={() => setActive(false)}>Last</button>
        </div>
      )}
      <button>Outside</button>
    </>
  );
};

const button = (name: string) => screen.getByRole("button", { name });

describe("useFocusTrap", () => {
  it("moves focus inside when it activates", async () => {
    const user = userEvent.setup();
    render(<Trap />);

    await user.click(button("Open"));

    expect(button("First")).toHaveFocus();
  });

  it("wraps Tab and Shift+Tab inside the container", async () => {
    const user = userEvent.setup();
    render(<Trap />);
    await user.click(button("Open"));

    await user.tab({ shift: true });
    expect(button("Last")).toHaveFocus();

    await user.tab();
    expect(button("First")).toHaveFocus();
  });

  it("skips inert content", async () => {
    const user = userEvent.setup();
    render(<Trap inertMiddle />);
    await user.click(button("Open"));

    await user.tab();

    expect(button("Last")).toHaveFocus();
  });

  it("returns focus to where it was when it deactivates", async () => {
    const user = userEvent.setup();
    render(<Trap />);
    await user.click(button("Open"));

    await user.click(button("Last"));

    expect(button("Open")).toHaveFocus();
  });
});
