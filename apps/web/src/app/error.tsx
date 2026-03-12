"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Keep runtime errors visible in the browser console for debugging.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-start justify-center gap-4 px-6">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        An unexpected error occurred while loading this page.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md border px-4 py-2 text-sm font-medium"
      >
        Try again
      </button>
    </main>
  );
}
