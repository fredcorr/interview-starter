"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/atoms/Button";
import { ProductCard } from "@/components/molecules/ProductCard";
import { ProductCardSkeleton } from "@/components/molecules/ProductCardSkeleton";
import { fetchProducts, PRODUCTS_PAGE_SIZE } from "@/utils/fetch-products";
import { PRODUCT_GRID_CLASS } from "@/utils/product-grid";

export interface LoadMoreProductListProps {
  /** Server-rendered `<li>` items for the first page. */
  children: ReactNode;
  /** How many items `children` contains; the client continues from here. */
  initialCount: number;
  /** Total products available, as reported by the first page. */
  total: number;
}

export function LoadMoreProductList({
  children,
  initialCount,
  total,
}: LoadMoreProductListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const pendingFocusIndex = useRef<number | null>(null);

  const { data, fetchNextPage, isFetching, isError } = useInfiniteQuery({
    queryKey: ["products", "list", { pageSize: PRODUCTS_PAGE_SIZE, initialCount }],
    queryFn: ({ pageParam, signal }) =>
      fetchProducts({ skip: pageParam, limit: PRODUCTS_PAGE_SIZE, signal }),
    initialPageParam: initialCount,
    getNextPageParam: (lastPage) => {
      const next = lastPage.skip + lastPage.products.length;
      return next < lastPage.total ? next : undefined;
    },
    // Nothing is fetched until the user asks for more; the first page is
    // already server-rendered.
    enabled: false,
  });

  const extraProducts = data?.pages.flatMap((page) => page.products) ?? [];
  const latestTotal = data?.pages.at(-1)?.total ?? total;
  const loadedCount = initialCount + extraProducts.length;
  const hasMore = loadedCount < latestTotal;
  const lastPage = data?.pages.at(-1);
  // Polite live region: changes only when a new page lands.
  const announcement = lastPage
    ? `Loaded ${lastPage.products.length} more products. Showing ${loadedCount} of ${latestTotal}.`
    : "";

  // After a page arrives, move focus to its first new card so keyboard and
  // screen reader users continue from where the new content starts.
  useEffect(() => {
    const index = pendingFocusIndex.current;
    if (index === null || index >= loadedCount) return;
    pendingFocusIndex.current = null;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
      ?.focus();
  }, [loadedCount]);

  function handleLoadMore() {
    pendingFocusIndex.current = loadedCount;
    void fetchNextPage();
  }

  const skeletonCount = Math.min(PRODUCTS_PAGE_SIZE, latestTotal - loadedCount);

  return (
    <section aria-label="Product results" className="flex flex-col gap-8">
      <ul ref={listRef} role="list" className={PRODUCT_GRID_CLASS}>
        {children}
        {extraProducts.map((product, offset) => (
          <li
            key={product.id}
            data-index={initialCount + offset}
            tabIndex={-1}
            className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ProductCard product={product} />
          </li>
        ))}
        {isFetching &&
          Array.from({ length: skeletonCount }, (_, index) => (
            <li key={`skeleton-${index}`} aria-hidden="true">
              <ProductCardSkeleton />
            </li>
          ))}
      </ul>

      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted">
          Showing {loadedCount} of {latestTotal} products
        </p>

        {isError && !isFetching && (
          <p role="alert" className="text-sm text-foreground">
            We couldn&apos;t load more products. Please try again.
          </p>
        )}

        {hasMore ? (
          <Button loading={isFetching} onClick={handleLoadMore}>
            {isFetching
              ? "Loading products…"
              : isError
                ? "Try again"
                : "Load more products"}
          </Button>
        ) : (
          <p className="text-sm text-muted">You&apos;ve seen all products.</p>
        )}

        <p role="status" className="sr-only">
          {announcement}
        </p>
      </div>
    </section>
  );
}
