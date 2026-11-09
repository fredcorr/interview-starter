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
  /** Search query the first page was fetched with. */
  query?: string;
  /** How many items `children` contains; the client continues from here. */
  initialCount: number;
  /** Total products available, as reported by the first page. */
  total: number;
}

function resultsSummary(query: string, shown: number, total: number) {
  if (total === 0) {
    return query ? `No products found for “${query}”.` : "No products available.";
  }
  return query
    ? `Showing ${shown} of ${total} results for “${query}”`
    : `Showing ${shown} of ${total} products`;
}

export function LoadMoreProductList({
  children,
  query = "",
  initialCount,
  total,
}: LoadMoreProductListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const pendingFocusIndex = useRef<number | null>(null);

  const { data, fetchNextPage, isFetching, isError } = useInfiniteQuery({
    queryKey: [
      "products",
      "list",
      { query, pageSize: PRODUCTS_PAGE_SIZE, initialCount },
    ],
    queryFn: ({ pageParam, signal }) =>
      fetchProducts({
        query,
        skip: pageParam,
        limit: PRODUCTS_PAGE_SIZE,
        signal,
      }),
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

  // After a page arrives, move focus to its first new card so keyboard and
  // screen reader users continue from where the new content starts.
  useEffect(() => {
    const index = pendingFocusIndex.current;
    if (index === null || index >= loadedCount) return;
    pendingFocusIndex.current = null;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${index}"] article`)
      ?.focus();
  }, [loadedCount]);

  function handleLoadMore() {
    pendingFocusIndex.current = loadedCount;
    void fetchNextPage();
  }

  const skeletonCount = Math.min(PRODUCTS_PAGE_SIZE, latestTotal - loadedCount);

  return (
    <section aria-label="Product results" className="flex flex-col gap-8">
      {latestTotal > 0 && (
        <ul ref={listRef} role="list" className={PRODUCT_GRID_CLASS}>
          {children}
          {extraProducts.map((product, offset) => (
            <li key={product.id} data-index={initialCount + offset}>
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
      )}

      <div className="flex flex-col items-center gap-3">
        {/* Stays mounted across searches so changes are announced. */}
        <p role="status" className="text-sm text-muted">
          {resultsSummary(query, loadedCount, latestTotal)}
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
          latestTotal > 0 && (
            <p className="text-sm text-muted">
              You&apos;ve seen all {query ? "results" : "products"}.
            </p>
          )
        )}
      </div>
    </section>
  );
}
