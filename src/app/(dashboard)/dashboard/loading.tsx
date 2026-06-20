import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[120px] rounded-md" />
          <Skeleton className="h-10 w-[120px] rounded-md" />
          <Skeleton className="h-10 w-[120px] rounded-md" />
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="dark:border-white/10 dark:bg-[#161616] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-6 rounded-md" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2 mt-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Main Content Area */}
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Weekly Progress Skeleton */}
            <Card className="dark:border-white/10 dark:bg-[#161616] flex flex-col h-full shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32 mb-1.5" />
                <Skeleton className="h-3 w-48" />
              </CardHeader>
              <CardContent className="flex-1 mt-2">
                <Skeleton className="h-64 w-full rounded-xl opacity-50" />
              </CardContent>
            </Card>

            {/* Retention Chart Skeleton */}
            <Card className="dark:border-white/10 dark:bg-[#161616] flex flex-col h-full shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-40 mb-1.5" />
                <Skeleton className="h-3 w-56" />
              </CardHeader>
              <CardContent className="flex-1 mt-2 flex items-center justify-center">
                <Skeleton className="h-48 w-48 rounded-full opacity-50" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Lessons Skeleton */}
          <Card className="dark:border-white/10 dark:bg-[#161616] shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-32 mb-1.5" />
              <Skeleton className="h-3 w-64" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[76px] w-full rounded-xl opacity-60" />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="space-y-4">
          {/* Daily Quests Skeleton */}
          <Card className="dark:border-white/10 dark:bg-[#161616] shadow-sm">
             <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-8 rounded-full" />
             </CardHeader>
             <CardContent className="space-y-4 mt-2">
               <div className="space-y-1.5 mb-6">
                 <Skeleton className="h-3 w-full" />
                 <Skeleton className="h-3 w-4/5" />
               </div>
               {Array.from({ length: 3 }).map((_, i) => (
                 <div key={i} className="flex gap-4">
                   <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                   <div className="space-y-2 w-full pt-1">
                     <Skeleton className="h-3.5 w-3/4" />
                     <Skeleton className="h-2.5 w-1/2" />
                     <Skeleton className="h-1.5 w-full rounded-full mt-3 opacity-40" />
                   </div>
                 </div>
               ))}
             </CardContent>
          </Card>

          {/* Today Review Skeleton */}
          <Card className="dark:border-white/10 dark:bg-[#161616] shadow-sm">
             <CardHeader>
                <Skeleton className="h-5 w-32 mb-1.5" />
                <Skeleton className="h-3 w-48" />
             </CardHeader>
             <CardContent className="flex flex-col items-center justify-center py-8">
                <Skeleton className="h-12 w-12 rounded-full mb-5 opacity-40" />
                <Skeleton className="h-3 w-40 mb-6" />
                <Skeleton className="h-10 w-full rounded-lg" />
             </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
