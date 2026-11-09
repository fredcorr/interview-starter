import { cacheLife, cacheTag } from "next/cache";
import { ProductCard } from "@/components/molecules/ProductCard";
import { LoadMoreProductList } from "@/components/organisms/LoadMoreProductList";
import { fetchProducts, PRODUCTS_PAGE_SIZE } from "@/utils/fetch-products";

/** Cards in the first row get eager, high-priority thumbnails (LCP). */
const EAGER_IMAGE_COUNT = 4;

export interface ProductListProps {
  /** Normalised search query; part of the cache key. Empty = all products. */
  query?: string;
}

/**
 * First page of products (optionally filtered), rendered on the server and
 * cached with Cache Components, one entry per query. Further pages are
 * fetched on the client by LoadMoreProductList.
 */
export async function ProductList({ query = "" }: ProductListProps) {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const { products, total } = await fetchProducts({
    query,
    skip: 0,
    limit: PRODUCTS_PAGE_SIZE,
  });

  return (
    <LoadMoreProductList
      query={query}
      initialCount={products.length}
      total={total}
    >
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            eagerImage={index < EAGER_IMAGE_COUNT}
          />
        </li>
      ))}
    </LoadMoreProductList>
  );
}
