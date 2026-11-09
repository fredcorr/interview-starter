import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

const VARIANTS = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 aria-disabled:opacity-70",
  ghost: "text-muted hover:bg-surface-muted hover:text-foreground",
} as const;

const SIZES = {
  md: "min-h-11 px-5 py-2 text-sm font-medium",
  /** Square, for icon-only buttons. Always pass an aria-label. */
  icon: "size-11",
} as const;

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  /** Shows a busy state. The button stays focusable so keyboard focus is not lost. */
  loading?: boolean;
}

export const Button = ({
  className,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  onClick,
  ...props
}: ButtonProps) => (
  <button
    type={type}
    aria-disabled={loading || undefined}
    aria-busy={loading || undefined}
    onClick={loading ? undefined : onClick}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-md transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 aria-disabled:cursor-progress",
      VARIANTS[variant],
      SIZES[size],
      className,
    )}
    {...props}
  />
);
