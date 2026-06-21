import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[rgba(255,255,255,0.05)]",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-white/5 bg-white/[0.02] p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-8 w-28 mb-3" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}
