import Image from "next/image";
import { Skeleton } from "@/components/atoms/Skeleton";
import { StarRating } from "@/components/molecules/StarRating";
import type { Product } from "@/types/product";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format-price";

export interface ProductCardProps {
  product: Product;
  /** Load the thumbnail eagerly; use for above-the-fold cards. */
  eagerImage?: boolean;
  className?: string;
}

const CARD_CLASS =
  "flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface";

export const ProductCard = ({
  product,
  eagerImage = false,
  className,
}: ProductCardProps) => {
  const titleId = `product-${product.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      // No product detail page yet, so the card itself is the keyboard stop.
      // When a detail route exists, make the title a link and drop tabIndex.
      tabIndex={0}
      className={cn(
        CARD_CLASS,
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      <div className="relative aspect-square bg-surface-muted">
        <Image
          src={product.thumbnail}
          // Decorative: the title right below already names the product.
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          loading={eagerImage ? "eager" : "lazy"}
          fetchPriority={eagerImage ? "high" : "auto"}
          className="object-contain p-6"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h2
          id={titleId}
          className="line-clamp-2 text-base leading-snug font-semibold text-foreground"
        >
          {product.title}
        </h2>
        {product.brand && <p className="text-sm text-muted">{product.brand}</p>}
        <StarRating rating={product.rating} className="mt-2" />
        <p className="mt-auto pt-4 text-xl font-bold tracking-tight text-foreground tabular-nums">
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
};

/** Loading placeholder that mirrors ProductCard's layout. */
export const ProductCardSkeleton = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    data-testid="product-card-skeleton"
    className={cn(CARD_CLASS, className)}
  >
    <Skeleton className="aspect-square rounded-none" />
    <div className="flex flex-col gap-2 p-4">
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="mt-2 h-4 w-24" />
      <Skeleton className="mt-4 h-6 w-16" />
    </div>
  </div>
);
