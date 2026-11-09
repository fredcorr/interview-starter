"use client";

import { useEffect } from "react";
import { Button } from "@/components/atoms/Button";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted">We couldn&apos;t load this page.</p>
      <Button onClick={() => retry()}>Try again</Button>
    </main>
  );
}
