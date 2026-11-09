import { cacheLife, cacheTag } from "next/cache";
import type { ProductsPage } from "@/types/product";
import { fetchProducts, PRODUCTS_PAGE_SIZE } from "@/utils/fetch-products";

/**
 * First page of products for a query, cached on the server with Cache
 * Components (one entry per query, revalidated hourly). Server-only.
 */
export const getProducts = async (query = ""): Promise<ProductsPage> => {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  return fetchProducts({ query, skip: 0, limit: PRODUCTS_PAGE_SIZE });
};
