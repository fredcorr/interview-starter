import { cn } from "@/utils/cn";

export interface ProductCardSkeletonProps {
  className?: string;
}

/** Placeholder matching ProductCard's layout. Hidden from assistive tech. */
export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="product-card-skeleton"
      className={cn(
        "flex h-full animate-pulse flex-col overflow-hidden rounded-xl border border-border bg-surface motion-reduce:animate-none",
        className,
      )}
    >
      <div className="aspect-square bg-surface-muted" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-4/5 rounded bg-surface-muted" />
        <div className="h-3 w-1/3 rounded bg-surface-muted" />
        <div className="mt-2 h-4 w-24 rounded bg-surface-muted" />
        <div className="mt-4 h-6 w-16 rounded bg-surface-muted" />
      </div>
    </div>
  );
}
