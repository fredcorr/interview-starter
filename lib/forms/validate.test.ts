import type { FieldConfig } from "@/types/form";
import { validateField, validateForm } from "./validate";

const fields = [
  { type: "text", name: "companyName", label: "Company name" },
] as const satisfies readonly FieldConfig[];

describe("validateForm", () => {
  it("rejects a missing required field with a message built from its label", () => {
    const result = validateForm(fields, { companyName: "" });

    expect(result).toEqual({
      ok: false,
      fieldErrors: { companyName: "Enter company name" },
      failedRules: { companyName: "required" },
    });
  });

  it("accepts an empty optional field and returns trimmed values", () => {
    const withNotes = [
      ...fields,
      { type: "textarea", name: "notes", label: "Notes", optional: true },
    ] as const satisfies readonly FieldConfig[];

    expect(
      validateForm(withNotes, { companyName: "  Acme  ", notes: "" }),
    ).toEqual({ ok: true, values: { companyName: "Acme", notes: undefined } });
  });

  it("checks email format", () => {
    const email = [
      { type: "email", name: "email", label: "Email address" },
    ] as const satisfies readonly FieldConfig[];

    expect(validateForm(email, { email: "not-an-email" })).toEqual({
      ok: false,
      fieldErrors: {
        email: "Enter a valid email address, like name@company.com",
      },
      failedRules: { email: "email" },
    });
    expect(validateForm(email, { email: "jo@acme.com" }).ok).toBe(true);
  });

  it("limits text length", () => {
    const notes = [
      { type: "textarea", name: "notes", label: "Notes", maxLength: 5 },
    ] as const satisfies readonly FieldConfig[];

    expect(validateForm(notes, { notes: "123456" })).toMatchObject({
      fieldErrors: { notes: "Notes must be 5 characters or fewer" },
      failedRules: { notes: "maxLength" },
    });
  });

  describe("number fields", () => {
    const quantity = [
      {
        type: "number",
        name: "quantity",
        label: "Quantity",
        min: 1,
        max: 100,
        integer: true,
      },
    ] as const satisfies readonly FieldConfig[];

    it.each([
      ["", "required", "Enter quantity"],
      ["abc", "number", "Quantity must be a number"],
      ["1.5", "integer", "Quantity must be a whole number"],
      ["0", "range", "Quantity must be between 1 and 100"],
      ["101", "range", "Quantity must be between 1 and 100"],
    ])("rejects %p (%s)", (value, rule, message) => {
      expect(validateForm(quantity, { quantity: value })).toEqual({
        ok: false,
        fieldErrors: { quantity: message },
        failedRules: { quantity: rule },
      });
    });

    it.each([
      ["1", 1],
      ["100", 100],
    ])("accepts %p and returns it as a number", (value, parsed) => {
      expect(validateForm(quantity, { quantity: value })).toEqual({
        ok: true,
        values: { quantity: parsed },
      });
    });
  });

  describe("date fields", () => {
    const delivery = [
      {
        type: "date",
        name: "deliveryDate",
        label: "Delivery date",
        minDaysFromToday: 2,
      },
    ] as const satisfies readonly FieldConfig[];
    const validate = (value: string, options: { server?: boolean; now: Date }) =>
      validateForm(delivery, { deliveryDate: value }, options);

    // Local noon on 9 Nov 2026: today + 2 is 11 Nov.
    const localNow = new Date(2026, 10, 9, 12);

    it("asks for a date when empty", () => {
      expect(validate("", { now: localNow })).toMatchObject({
        fieldErrors: { deliveryDate: "Choose a delivery date" },
      });
    });

    it.each(["2026-13-01", "2026-02-30", "next week"])(
      "rejects %p as not a real date",
      (value) => {
        expect(validate(value, { now: localNow })).toMatchObject({
          fieldErrors: { deliveryDate: "Delivery date must be a real date" },
          failedRules: { deliveryDate: "date" },
        });
      },
    );

    it("requires today + minDaysFromToday in the user's timezone", () => {
      expect(validate("2026-11-10", { now: localNow })).toEqual({
        ok: false,
        fieldErrors: {
          deliveryDate: "Choose a delivery date on or after 11 November 2026",
        },
        failedRules: { deliveryDate: "minDate" },
      });
      expect(validate("2026-11-11", { now: localNow })).toEqual({
        ok: true,
        values: { deliveryDate: "2026-11-11" },
      });
    });

    it("allows one day of timezone slack on the server, counted in UTC", () => {
      const utcNow = new Date(Date.UTC(2026, 10, 9, 12));

      expect(validate("2026-11-10", { server: true, now: utcNow }).ok).toBe(
        true,
      );
      expect(validate("2026-11-09", { server: true, now: utcNow })).toMatchObject(
        { failedRules: { deliveryDate: "minDate" } },
      );
    });
  });

  describe("hidden fields", () => {
    const product = [
      {
        type: "hidden",
        name: "productId",
        label: "Product",
        pattern: "[1-9]\\d*",
      },
    ] as const satisfies readonly FieldConfig[];

    it.each([
      ["", "required"],
      ["abc", "pattern"],
      ["0", "pattern"],
      ["12; drop", "pattern"],
    ])("rejects %p (%s)", (value, rule) => {
      expect(validateForm(product, { productId: value })).toMatchObject({
        ok: false,
        failedRules: { productId: rule },
      });
    });

    it("accepts a value matching the whole pattern", () => {
      expect(validateForm(product, { productId: "42" }).ok).toBe(true);
    });
  });

  it("only accepts listed options for a select", () => {
    const size = [
      {
        type: "select",
        name: "size",
        label: "Size",
        options: [{ value: "s", label: "Small" }],
      },
    ] as const satisfies readonly FieldConfig[];

    expect(validateForm(size, { size: "xl" })).toMatchObject({
      failedRules: { size: "oneOf" },
      fieldErrors: { size: "Choose a size from the list" },
    });
    expect(validateForm(size, { size: "s" }).ok).toBe(true);
  });

  it("drops values that aren't fields of the form", () => {
    expect(
      validateForm(fields, { companyName: "Acme", isAdmin: "true" }),
    ).toEqual({ ok: true, values: { companyName: "Acme" } });
  });

  it("uses a field's own message over the generated one", () => {
    const custom = [
      { ...fields[0], messages: { required: "Tell us who you work for" } },
    ] as const satisfies readonly FieldConfig[];

    const result = validateForm(custom, { companyName: "" });

    expect(result.ok || result.fieldErrors.companyName).toBe(
      "Tell us who you work for",
    );
  });
});

describe("validateField", () => {
  const form = [
    { type: "text", name: "companyName", label: "Company name" },
    { type: "email", name: "email", label: "Email address" },
  ] as const satisfies readonly FieldConfig[];

  it("returns only the named field's error", () => {
    expect(validateField(form, "email", { companyName: "", email: "x" })).toBe(
      "Enter a valid email address, like name@company.com",
    );
  });

  it("returns undefined when the field is valid, even if others aren't", () => {
    expect(
      validateField(form, "email", { companyName: "", email: "jo@acme.com" }),
    ).toBeUndefined();
  });
});
