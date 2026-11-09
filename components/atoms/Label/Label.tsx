import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

export interface LabelProps extends ComponentProps<"label"> {
  /** Fields are required by default; optional ones say so in their label. */
  optional?: boolean;
}

export const Label = ({
  optional = false,
  className,
  children,
  ...props
}: LabelProps) => (
  <label
    className={cn("text-sm font-medium text-foreground", className)}
    {...props}
  >
    {children}
    {optional && <span className="font-normal text-muted"> (optional)</span>}
  </label>
);
