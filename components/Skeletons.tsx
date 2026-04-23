interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200 ${className || ''}`} />
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-12 w-24 rounded-2xl" />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>
      
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
      <Skeleton className="h-6 w-6" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-12" />
    </div>
  )
}

export function WalletCardSkeleton() {
  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-10 bg-white/10" />
        <Skeleton className="h-6 w-16 bg-white/10" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24 bg-white/10" />
        <Skeleton className="h-10 w-40 bg-white/10" />
      </div>
      <Skeleton className="h-4 w-full bg-white/10" />
    </div>
  )
}
