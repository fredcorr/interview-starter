import * as yup from "yup";
import type { Product, ProductsPage } from "@/types/product";

export const PRODUCTS_PAGE_SIZE = 20;

const PRODUCTS_URL = "https://dummyjson.com/products";
const PRODUCT_FIELDS = ["title", "thumbnail", "brand", "price", "rating"];

const productSchema: yup.ObjectSchema<Product> = yup.object({
  id: yup.number().required(),
  title: yup.string().required(),
  thumbnail: yup.string().required(),
  brand: yup.string().optional(),
  price: yup.number().required(),
  rating: yup.number().required(),
});

const productsPageSchema: yup.ObjectSchema<ProductsPage> = yup.object({
  products: yup.array(productSchema).required(),
  total: yup.number().required(),
  skip: yup.number().required(),
  limit: yup.number().required(),
});

export interface FetchProductsParams {
  skip?: number;
  limit?: number;
  signal?: AbortSignal;
}

/**
 * Fetches one page of products. Shared by the cached server render
 * (first page) and the client-side "Load more" query.
 */
export async function fetchProducts({
  skip = 0,
  limit = PRODUCTS_PAGE_SIZE,
  signal,
}: FetchProductsParams = {}): Promise<ProductsPage> {
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
    select: PRODUCT_FIELDS.join(","),
  });

  const response = await fetch(`${PRODUCTS_URL}?${params}`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to load products (HTTP ${response.status})`);
  }

  const body: unknown = await response.json();
  return productsPageSchema.validate(body, { stripUnknown: true });
}
