import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";
import { FIELD_CLASS } from "@/utils/field-class";

export interface SelectProps extends ComponentProps<"select"> {
  options: readonly { value: string; label: string }[];
  /** First, empty option shown until the user picks one. */
  placeholder?: string;
}

/** Native select: keyboard, screen reader and mobile pickers come for free. */
export const Select = ({
  options,
  placeholder = "Select an option",
  className,
  ...props
}: SelectProps) => (
  <select className={cn(FIELD_CLASS, "h-11", className)} {...props}>
    <option value="">{placeholder}</option>
    {options.map(({ value, label }) => (
      <option key={value} value={value}>
        {label}
      </option>
    ))}
  </select>
);
