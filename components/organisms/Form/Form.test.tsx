import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getMinDate } from "@/lib/forms/dates";
import { quoteFields } from "@/lib/forms/quote";
import type { FormActionState } from "@/types/form";
import { Form } from "./Form";

type Action = (prev: FormActionState, data: FormData) => Promise<FormActionState>;

/** An action whose result the test resolves by hand. */
const controllableAction = () => {
  let resolve: (state: FormActionState) => void = () => {};
  const action = jest.fn<ReturnType<Action>, Parameters<Action>>(
    () => new Promise((done) => (resolve = done)),
  );
  return { action, respond: (state: FormActionState) => act(() => resolve(state)) };
};

const renderForm = (action: Action = jest.fn()) => {
  const user = userEvent.setup();
  render(
    <Form
      id="quote"
      label="Request a quote"
      fields={quoteFields}
      action={action}
      hiddenValues={{ productId: "7" }}
      copy={{
        submit: "Request quote",
        successMessage: (values) => `We'll reply to ${values.email}.`,
      }}
    />,
  );
  return user;
};

const field = (name: string) => screen.getByRole("textbox", { name });
const submit = () => screen.getByRole("button", { name: "Request quote" });

const fillValidQuote = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(field("Company name"), "Acme Ltd");
  await user.type(field("Email address"), "jo@acme.com");
  await user.type(screen.getByRole("spinbutton", { name: "Quantity" }), "10");
  await user.type(screen.getByLabelText("Delivery date"), getMinDate(2));
};

describe("Form", () => {
  it("renders every visible field and pre-fills hidden ones", () => {
    const { container } = render(
      <Form
        id="quote"
        label="Request a quote"
        fields={quoteFields}
        action={jest.fn()}
        hiddenValues={{ productId: "7" }}
      />,
    );

    expect(field("Company name")).toBeInTheDocument();
    expect(field("Email address")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Quantity" })).toBeInTheDocument();
    expect(screen.getByLabelText("Delivery date")).toBeInTheDocument();
    expect(field("Notes (optional)")).toBeInTheDocument();
    expect(container.querySelector("input[name=productId]")).toHaveValue("7");
  });

  it("validates a field when the user leaves it, and clears the error once fixed", async () => {
    const user = renderForm();

    await user.click(field("Email address"));
    await user.tab();
    expect(field("Email address")).toHaveAccessibleDescription(
      "We'll send your quote here. Error: Enter email address",
    );

    await user.type(field("Email address"), "jo@acme.com");
    expect(field("Email address")).not.toHaveAttribute("aria-invalid");
  });

  it("lists every problem on submit, focuses the summary and keeps the button enabled", async () => {
    const action = jest.fn();
    const user = renderForm(action);

    await user.click(submit());

    const summary = screen.getByRole("alert");
    expect(summary).toHaveFocus();
    expect(
      within(summary).getByRole("heading", { name: "Fix 4 fields to send your request" }),
    ).toBeInTheDocument();
    expect(
      within(summary).getAllByRole("link").map((link) => link.textContent),
    ).toEqual([
      "Enter company name",
      "Enter email address",
      "Enter quantity",
      "Choose a delivery date",
    ]);
    expect(submit()).toBeEnabled();
    expect(action).not.toHaveBeenCalled();

    await user.click(within(summary).getByRole("link", { name: "Enter quantity" }));
    expect(screen.getByRole("spinbutton", { name: "Quantity" })).toHaveFocus();
  });

  it("shows an accessible loading state while sending, then the success copy", async () => {
    const { action, respond } = controllableAction();
    const user = renderForm(action);
    await fillValidQuote(user);

    await user.click(submit());

    expect(action).toHaveBeenCalledTimes(1);
    const data = action.mock.calls[0][1];
    expect(Object.fromEntries(data)).toMatchObject({
      productId: "7",
      companyName: "Acme Ltd",
      quantity: "10",
    });
    expect(screen.getByRole("form", { name: "Request a quote" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(field("Company name").closest("[inert]")).not.toBeNull();
    expect(screen.getByText("Sending your request…")).toBeInTheDocument();
    const sending = screen.getByRole("button", { name: /sending/i });
    expect(sending).toHaveAttribute("aria-disabled", "true");
    expect(sending).toHaveFocus();

    await user.click(sending);
    expect(action).toHaveBeenCalledTimes(1);

    await respond({ status: "success", requestId: "r1" });

    const heading = screen.getByRole("heading", { name: "Request sent" });
    expect(heading).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("We'll reply to jo@acme.com.");
  });

  it("shows the error copy with a reference and resends the same data", async () => {
    const { action, respond } = controllableAction();
    const user = renderForm(action);
    await fillValidQuote(user);
    await user.click(submit());

    await respond({ status: "error", requestId: "req-123" });

    expect(screen.getByRole("heading", { name: "Request not sent" })).toHaveFocus();
    expect(screen.getByRole("alert")).toHaveTextContent("req-123");

    await user.click(screen.getByRole("button", { name: "Resend" }));
    expect(action).toHaveBeenCalledTimes(2);
    expect(action.mock.calls[1][1]).toBe(action.mock.calls[0][1]);

    await respond({ status: "success", requestId: "r2" });
    expect(screen.getByRole("heading", { name: "Request sent" })).toBeInTheDocument();
  });

  it("goes back to the filled-in form from the result", async () => {
    const { action, respond } = controllableAction();
    const user = renderForm(action);
    await fillValidQuote(user);
    await user.click(submit());
    await respond({ status: "success" });

    await user.click(screen.getByRole("button", { name: "Edit request" }));

    expect(field("Company name")).toHaveValue("Acme Ltd");
    expect(field("Company name")).toHaveFocus();
  });

  it("shows field errors returned by the server", async () => {
    const { action, respond } = controllableAction();
    const user = renderForm(action);
    await fillValidQuote(user);
    await user.click(submit());

    await respond({
      status: "error",
      fieldErrors: { productId: "This product can't be quoted. Please reload the page." },
    });

    const summary = screen.getByRole("alert");
    expect(summary).toHaveFocus();
    expect(summary).toHaveTextContent(
      "Fix 1 field to send your requestThis product can't be quoted. Please reload the page.",
    );
  });

  it("treats a failed action call as an error, not a crash", async () => {
    const action = jest.fn().mockRejectedValue(new Error("Network down"));
    const user = renderForm(action);
    await fillValidQuote(user);

    await user.click(submit());

    expect(await screen.findByRole("heading", { name: "Request not sent" })).toBeInTheDocument();
  });
});
