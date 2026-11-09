import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "h-11 w-full rounded-md border border-muted bg-surface px-3 text-base text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
