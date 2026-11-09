import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";
import { FIELD_CLASS } from "@/utils/field-class";

export type InputProps = ComponentProps<"input">;

export const Input = ({ className, type = "text", ...props }: InputProps) => (
  <input
    type={type}
    className={cn(
      FIELD_CLASS,
      "h-11",
      className,
    )}
    {...props}
  />
);
