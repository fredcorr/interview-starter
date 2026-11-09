import type { FieldConfig } from "@/types/form";

export const quoteFields = [
  {
    type: "hidden",
    name: "productId",
    label: "Product",
    pattern: "[1-9]\\d*",
    messages: {
      required: "This product can't be quoted. Please reload the page.",
      pattern: "This product can't be quoted. Please reload the page.",
    },
  },
  {
    type: "text",
    name: "companyName",
    label: "Company name",
    autoComplete: "organization",
    maxLength: 120,
  },
  {
    type: "email",
    name: "email",
    label: "Email address",
    hint: "We'll send your quote here.",
    autoComplete: "email",
    maxLength: 254,
  },
  {
    type: "number",
    name: "quantity",
    label: "Quantity",
    hint: "Between 1 and 100 units.",
    min: 1,
    max: 100,
    integer: true,
  },
  {
    type: "date",
    name: "deliveryDate",
    label: "Delivery date",
    hint: "The earliest we can deliver is 2 days from today.",
    minDaysFromToday: 2,
  },
  {
    type: "textarea",
    name: "notes",
    label: "Notes",
    hint: "Anything we should know, like packaging or delivery instructions.",
    optional: true,
    maxLength: 1000,
  },
] as const satisfies readonly FieldConfig[];
