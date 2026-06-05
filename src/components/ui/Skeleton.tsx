import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700",
        className,
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
      <Skeleton className="mb-3 h-4 w-3/4" />
      <Skeleton className="mb-2 h-3 w-1/2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
}
