import { cn } from "@/lib/utils"

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "shimmer" | "pulse"
}) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        variant === "shimmer" && "bg-gradient-to-r from-muted via-muted/70 to-muted bg-[length:200%_100%] animate-shimmer",
        variant === "pulse" && "animate-pulse-slow",
        variant === "default" && "animate-pulse",
        className
      )}
      {...props}
    />
  )
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/60 bg-card p-8 space-y-4", className)}>
      <div className="flex items-start space-x-4">
        <Skeleton variant="shimmer" className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="shimmer" className="h-4 w-3/4" />
          <Skeleton variant="shimmer" className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="shimmer" className="h-3 w-full" />
        <Skeleton variant="shimmer" className="h-3 w-5/6" />
        <Skeleton variant="shimmer" className="h-3 w-4/6" />
      </div>
    </div>
  )
}

export { Skeleton, CardSkeleton }
