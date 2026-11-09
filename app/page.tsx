import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCardSkeleton } from "@/components/molecules/ProductCardSkeleton";
import { SearchBar } from "@/components/molecules/SearchBar";
import { ProductList } from "@/components/organisms/ProductList";
import {
  PRODUCT_SEARCH_LABEL,
  ProductSearch,
} from "@/components/organisms/ProductSearch";
import { PRODUCTS_PAGE_SIZE } from "@/utils/fetch-products";
import { getProducts } from "@/utils/get-products";
import { PRODUCT_GRID_CLASS } from "@/utils/product-grid";
import { parseSearchQuery, SEARCH_PARAM } from "@/utils/search-query";

export const metadata: Metadata = {
  title: "Products",
};

/** Reads `?q=` at request time and fetches the cached first page for it. */
const ProductResults = async ({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) => {
  const query = parseSearchQuery((await searchParams)[SEARCH_PARAM]);
  const initialPage = await getProducts(query);
  return <ProductList query={query} initialPage={initialPage} />;
};

const ResultsFallback = () => (
  <div role="status" aria-label="Loading products">
    <ul role="list" aria-hidden="true" className={PRODUCT_GRID_CLASS}>
      {Array.from({ length: PRODUCTS_PAGE_SIZE }, (_, index) => (
        <li key={index}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  </div>
);

const ProductsPage = ({ searchParams }: PageProps<"/">) => (
  <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:py-14">
    <header className="mb-6 flex flex-col gap-2">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Products
      </h1>
      <p className="text-muted">Browse the full catalogue.</p>
    </header>

    <Suspense
      fallback={<SearchBar label={PRODUCT_SEARCH_LABEL} value="" disabled />}
    >
      <ProductSearch />
    </Suspense>

    <div className="mt-6">
      <Suspense fallback={<ResultsFallback />}>
        <ProductResults searchParams={searchParams} />
      </Suspense>
    </div>
  </main>
);

export default ProductsPage;
