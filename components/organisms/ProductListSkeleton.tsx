import { ProductCardSkeleton } from "@/components/molecules/ProductCardSkeleton";
import { PRODUCTS_PAGE_SIZE } from "@/utils/fetch-products";
import { PRODUCT_GRID_CLASS } from "@/utils/product-grid";

export interface ProductListSkeletonProps {
  count?: number;
}

export function ProductListSkeleton({
  count = PRODUCTS_PAGE_SIZE,
}: ProductListSkeletonProps) {
  return (
    <div role="status" aria-label="Loading products">
      <ul role="list" aria-hidden="true" className={PRODUCT_GRID_CLASS}>
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>
            <ProductCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}
