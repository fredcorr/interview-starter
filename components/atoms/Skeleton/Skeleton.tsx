import { cn } from "@/utils/cn";

export interface SkeletonProps {
  /** Size and shape come from the caller, e.g. "h-4 w-24" or "aspect-square". */
  className?: string;
}

/** Placeholder block for loading states. Decorative, so hidden from assistive tech. */
export const Skeleton = ({ className }: SkeletonProps) => (
  <div
    aria-hidden="true"
    data-testid="skeleton"
    className={cn(
      "animate-pulse rounded bg-surface-muted motion-reduce:animate-none",
      className,
    )}
  />
);
