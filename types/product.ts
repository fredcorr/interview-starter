export interface Product {
  id: number;
  title: string;
  thumbnail: string;
  /** Not every DummyJSON product has a brand. */
  brand?: string;
  price: number;
  rating: number;
}

export interface ProductsPage {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}
