"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service (e.g. Sentry)
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full">
        <EmptyState 
          icon={AlertCircle}
          iconColor="#EF4444"
          title="Something went wrong!"
          description="We encountered an unexpected error while rendering this page. Our team has been notified."
          actionLabel="Try Again"
          onAction={() => reset()}
        />
      </div>
    </div>
  );
}
