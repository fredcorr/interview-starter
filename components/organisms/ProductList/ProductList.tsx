"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Button } from "@/components/atoms/Button";
import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/molecules/ProductCard";
import type { ProductsPage } from "@/types/product";
import { fetchProducts, PRODUCTS_PAGE_SIZE } from "@/utils/fetch-products";
import { PRODUCT_GRID_CLASS } from "@/utils/product-grid";

/** Cards in the first row get eager, high-priority thumbnails (LCP). */
const EAGER_IMAGE_COUNT = 4;

export interface ProductListProps {
  /** First page, fetched (and cached) on the server. */
  initialPage: ProductsPage;
  /** Search query `initialPage` was fetched with. Empty = all products. */
  query?: string;
}

const resultsSummary = (query: string, shown: number, total: number) => {
  if (total === 0) {
    return query
      ? `No products found for “${query}”.`
      : "No products available.";
  }
  return query
    ? `Showing ${shown} of ${total} results for “${query}”`
    : `Showing ${shown} of ${total} products`;
};

export const ProductList = ({ initialPage, query = "" }: ProductListProps) => {
  const listRef = useRef<HTMLUListElement>(null);
  const pendingFocusIndex = useRef<number | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfiniteQuery({
    queryKey: ["products", "list", { query, pageSize: PRODUCTS_PAGE_SIZE }],
    queryFn: ({ pageParam, signal }) =>
      fetchProducts({
        query,
        skip: pageParam,
        limit: PRODUCTS_PAGE_SIZE,
        signal,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const next = lastPage.skip + lastPage.products.length;
      return next < lastPage.total ? next : undefined;
    },
    // The server already rendered page one; the client only adds pages.
    initialData: { pages: [initialPage], pageParams: [0] },
    // Freshness is owned by the server cache; never refetch loaded pages.
    staleTime: Infinity,
  });

  const products = data.pages.flatMap((page) => page.products);
  const total = data.pages.at(-1)?.total ?? initialPage.total;

  // After a page arrives, move focus to its first new card so keyboard and
  // screen reader users continue from where the new content starts.
  useEffect(() => {
    const index = pendingFocusIndex.current;
    if (index === null || index >= products.length) return;
    pendingFocusIndex.current = null;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${index}"] article`)
      ?.focus();
  }, [products.length]);

  const handleLoadMore = () => {
    pendingFocusIndex.current = products.length;
    void fetchNextPage();
  };

  const skeletonCount = Math.min(PRODUCTS_PAGE_SIZE, total - products.length);

  return (
    <section aria-label="Product results" className="flex flex-col gap-8">
      {products.length > 0 && (
        <ul ref={listRef} role="list" className={PRODUCT_GRID_CLASS}>
          {products.map((product, index) => (
            <li key={product.id} data-index={index}>
              <ProductCard
                product={product}
                eagerImage={index < EAGER_IMAGE_COUNT}
              />
            </li>
          ))}
          {isFetchingNextPage &&
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
          {resultsSummary(query, products.length, total)}
        </p>

        {isFetchNextPageError && !isFetchingNextPage && (
          <p role="alert" className="text-sm text-foreground">
            We couldn&apos;t load more products. Please try again.
          </p>
        )}

        {hasNextPage && (
          <Button loading={isFetchingNextPage} onClick={handleLoadMore}>
            {isFetchingNextPage
              ? "Loading products…"
              : isFetchNextPageError
                ? "Try again"
                : "Load more products"}
          </Button>
        )}
      </div>
    </section>
  );
};
