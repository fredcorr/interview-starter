import type { Product, ProductsPage } from "@/types/product";

export const mockProduct: Product = {
  id: 1,
  title: "Essence Mascara Lash Princess",
  thumbnail:
    "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
  brand: "Essence",
  price: 9.99,
  rating: 4.5,
};

export const mockProductWithoutBrand: Product = {
  id: 2,
  title: "Kiwi",
  thumbnail:
    "https://cdn.dummyjson.com/product-images/groceries/kiwi/thumbnail.webp",
  price: 2.49,
  rating: 3.2,
};

export function makeProducts(count: number, startId = 1): Product[] {
  return Array.from({ length: count }, (_, index) => ({
    ...mockProduct,
    id: startId + index,
    title: `Product ${startId + index}`,
  }));
}

export function makeProductsPage(
  skip: number,
  limit: number,
  total: number,
): ProductsPage {
  const count = Math.max(Math.min(limit, total - skip), 0);
  return { products: makeProducts(count, skip + 1), total, skip, limit };
}
