"use client";

import { useEffect } from "react";
import { Button } from "@/components/atoms/Button";

interface ErrorPageProps {
  error: unknown;
  retry: () => void;
}

const ErrorPage = ({ error, retry }: ErrorPageProps) => {
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
};

export default ErrorPage;
