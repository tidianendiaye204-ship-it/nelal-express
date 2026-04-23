import { OrderCardSkeleton, WalletCardSkeleton, Skeleton } from '@/components/Skeletons'

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 pt-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* GREETING & WALLET SKELETON */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-12 w-12 rounded-2xl" />
            </div>
            <WalletCardSkeleton />
          </div>

          {/* INSTALL PROMPT SKELETON */}
          <Skeleton className="h-20 w-full rounded-3xl" />

          {/* PRIMARY ACTION SKELETON */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-32 ml-2" />
            <Skeleton className="h-40 w-full rounded-[2.5rem]" />
          </div>

          {/* ACTIVE ORDERS SKELETON */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-40 ml-2" />
            <div className="grid md:grid-cols-2 gap-4">
              <OrderCardSkeleton />
              <OrderCardSkeleton />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* HISTORY SKELETON */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm">
            <div className="flex justify-between mb-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          </div>

          <Skeleton className="h-48 w-full rounded-[2.5rem]" />
          <Skeleton className="h-48 w-full rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  )
}
