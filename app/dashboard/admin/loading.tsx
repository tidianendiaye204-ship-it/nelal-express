import { Skeleton, StatCardSkeleton } from '@/components/Skeletons'

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 pt-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-12 w-48 rounded-2xl" />
      </div>

      {/* STATS GRID SKELETON */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <Skeleton className="h-6 w-48 mb-8" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8">
            <Skeleton className="h-3 w-24 bg-white/10 mb-4" />
            <Skeleton className="h-10 w-48 bg-white/10 mb-8" />
            <Skeleton className="h-12 w-full bg-white/20 rounded-2xl" />
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
