import { OrderCardSkeleton, StatCardSkeleton, WalletCardSkeleton, Skeleton } from '@/components/Skeletons'

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 pt-8">
      {/* HEADER SKELETON */}
      <div className="mb-10">
        <Skeleton className="h-3 w-32 mb-4" />
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <Skeleton className="h-4 w-40" />
          </div>
          
          {/* ORDERS SKELETONS */}
          <div className="space-y-8">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        </div>

        <div className="space-y-6">
          <WalletCardSkeleton />
          
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <Skeleton className="h-3 w-32 mb-6" />
            <div className="grid grid-cols-2 gap-4">
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          </div>

          <Skeleton className="h-24 w-full rounded-[2.5rem]" />
          <Skeleton className="h-24 w-full rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  )
}
