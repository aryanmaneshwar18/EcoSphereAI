"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-red-500/10">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Critical System Error</h1>
          <p className="text-gray-400 max-w-md mb-8">
            EcoSphere AI has encountered a fatal error. We apologize for the inconvenience.
          </p>
          <button 
            onClick={() => reset()}
            className="btn-primary flex items-center gap-2"
          >
            <span>Restart Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
