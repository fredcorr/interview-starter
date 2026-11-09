import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductList } from "@/components/organisms/ProductList";
import { ProductListSkeleton } from "@/components/organisms/ProductListSkeleton";

export const metadata: Metadata = {
  title: "Products",
};

export default function ProductsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Products
        </h1>
        <p className="text-muted">Browse the full catalogue.</p>
      </header>

      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList />
      </Suspense>
    </main>
  );
}
