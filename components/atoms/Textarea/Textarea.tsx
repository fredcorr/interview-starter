import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";
import { FIELD_CLASS } from "@/utils/field-class";

export type TextareaProps = ComponentProps<"textarea">;

export const Textarea = ({ className, rows = 4, ...props }: TextareaProps) => (
  <textarea
    rows={rows}
    className={cn(FIELD_CLASS, "py-2 leading-relaxed", className)}
    {...props}
  />
);
