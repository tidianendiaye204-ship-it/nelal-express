import { Skeleton, StatCardSkeleton, WalletCardSkeleton } from '@/components/Skeletons'

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto pb-24 px-4 pt-8">
      {/* HEADER SKELETON */}
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <WalletCardSkeleton />
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        </div>
      </div>

      {/* HISTORY SKELETON */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-2 w-12 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
