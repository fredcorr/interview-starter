import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchBar } from "@/components/molecules/SearchBar";
import { ProductList } from "@/components/organisms/ProductList";
import { ProductListSkeleton } from "@/components/organisms/ProductListSkeleton";
import {
  PRODUCT_SEARCH_LABEL,
  ProductSearch,
} from "@/components/organisms/ProductSearch";
import { parseSearchQuery, SEARCH_PARAM } from "@/utils/search-query";

export const metadata: Metadata = {
  title: "Products",
};

/** Reads `?q=` at request time and hands it to the cached list. */
async function ProductResults({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const query = parseSearchQuery((await searchParams)[SEARCH_PARAM]);
  return <ProductList query={query} />;
}

export default function ProductsPage({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Products
        </h1>
        <p className="text-muted">Browse the full catalogue.</p>
      </header>

      <Suspense
        fallback={
          <SearchBar label={PRODUCT_SEARCH_LABEL} value="" disabled />
        }
      >
        <ProductSearch />
      </Suspense>

      <div className="mt-4">
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductResults searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
