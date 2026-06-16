import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RecentLessons } from "@/features/dashboard/components/recent-lessons";
import { StatsCards } from "@/features/dashboard/components/stats-cards";
import { TodayReview } from "@/features/dashboard/components/today-review";
import { WeeklyProgress } from "@/features/analytics/components/weekly-progress";
import { demoUser } from "@/lib/utils/demo-data";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export default async function DashboardPage() {
  let userName = demoUser.name;

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .single();
      userName = profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">Your English study desk</h1>
        </div>
        <QuickActions />
      </section>
      <StatsCards />
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Weekly activity</CardTitle>
            <CardDescription>Vocabulary learned and speaking minutes by day.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyProgress />
          </CardContent>
        </Card>
        <TodayReview />
      </section>
      <RecentLessons />
    </div>
  );
}
