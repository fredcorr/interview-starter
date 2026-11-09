import { cn } from "@/utils/cn";

export interface SpinnerProps {
  className?: string;
}

/**
 * Visual-only loading indicator. Announce the loading state in a live region
 * or through the busy control's label; this element is hidden from AT.
 */
export const Spinner = ({ className }: SpinnerProps) => (
  <span
    data-testid="spinner"
    aria-hidden="true"
    className={cn(
      "inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent",
      className,
    )}
  />
);
