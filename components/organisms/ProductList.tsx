import { cacheLife, cacheTag } from "next/cache";
import { ProductCard } from "@/components/molecules/ProductCard";
import { fetchProducts, PRODUCTS_PAGE_SIZE } from "@/utils/fetch-products";
import { LoadMoreProductList } from "./LoadMoreProductList";

/** Cards in the first row get eager, high-priority thumbnails (LCP). */
const EAGER_IMAGE_COUNT = 4;

/**
 * First page of products, rendered on the server and cached with
 * Cache Components so it is part of the prerendered static shell.
 * Further pages are fetched on the client by LoadMoreProductList.
 */
export async function ProductList() {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const { products, total } = await fetchProducts({
    skip: 0,
    limit: PRODUCTS_PAGE_SIZE,
  });

  return (
    <LoadMoreProductList initialCount={products.length} total={total}>
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
