import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shows a busy state. The button stays focusable so keyboard focus is not lost. */
  loading?: boolean;
}

export function Button({
  className,
  type = "button",
  loading = false,
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 aria-disabled:cursor-progress aria-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
