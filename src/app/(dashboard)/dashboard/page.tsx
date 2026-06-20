import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RecentLessons } from "@/features/dashboard/components/recent-lessons";
import { StatsCards } from "@/features/dashboard/components/stats-cards";
import { TodayReview } from "@/features/dashboard/components/today-review";
import { DailyQuests } from "@/features/dashboard/components/daily-quests";
import { BadgeShowcase } from "@/features/dashboard/components/badge-showcase";
import { WeeklyProgress } from "@/features/analytics/components/weekly-progress";
import { RetentionChart, type RetentionData } from "@/features/analytics/components/retention-chart";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { calculateStreak } from "@/features/streak/actions";
import { getAdaptiveQuests } from "@/features/dashboard/actions/quests";
import type { StatsData } from "@/features/dashboard/components/stats-cards";
import type { ReviewCard } from "@/features/dashboard/components/today-review";
import type { RecentLesson } from "@/features/dashboard/components/recent-lessons";
import type { WeeklyPoint } from "@/features/analytics/components/weekly-progress";

export default async function DashboardPage() {
 let userName = "User";
 let stats: StatsData = { lessonCount: 0, vocabCount: 0, flashcardDue: 0, streakDays: 0 };
 let reviewCards: ReviewCard[] = [];
 let recentLessons: RecentLesson[] = [];
 let weeklyData: WeeklyPoint[] = [];
 let retentionData: RetentionData = { mastered: 0, learning: 0, needsReview: 0 };
 let badgeStats = { vocabCount: 0, lessonCount: 0, quizCount: 0, bestQuizScore: 0, flashcardMastered: 0, totalReviews: 0, streakCount: 0 };
 let questsData: any[] = [];

 if (hasSupabaseConfig()) {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();

 if (user) {
 // User name
 const { data: profile } = await supabase
 .from("users")
 .select("name")
 .eq("id", user.id)
 .single();
 userName = profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "User";

 // Stats: counts + real streak
 const [lessonsRes, vocabRes, dueRes, streak, quizCountRes, bestScoreRes, masteredRes, reviewCountRes] = await Promise.all([
 supabase.from("lessons").select("id", { count: "exact", head: true }),
 supabase.from("vocabularies").select("id", { count: "exact", head: true }),
 supabase.from("flashcards").select("id", { count: "exact", head: true }).eq("user_id", user.id),
 calculateStreak(user.id),
 supabase.from("quizzes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
 supabase.from("quiz_attempts").select("score").eq("user_id", user.id).order("score", { ascending: false }).limit(1),
 supabase.from("flashcard_reviews").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("interval", 21),
 supabase.from("flashcard_reviews").select("id", { count: "exact", head: true }).eq("user_id", user.id),
 ]);

 stats = {
 lessonCount: lessonsRes.count ?? 0,
 vocabCount: vocabRes.count ?? 0,
 flashcardDue: dueRes.count ?? 0,
 streakDays: streak,
 };

 badgeStats = {
 vocabCount: vocabRes.count ?? 0,
 lessonCount: lessonsRes.count ?? 0,
 quizCount: quizCountRes.count ?? 0,
 bestQuizScore: bestScoreRes.data?.[0]?.score ?? 0,
 flashcardMastered: masteredRes.count ?? 0,
 totalReviews: reviewCountRes.count ?? 0,
 streakCount: streak,
 };

 questsData = await getAdaptiveQuests(user.id);

 // Today's review cards (personal flashcards with review data)
 const { data: dueCards } = await supabase
 .from("flashcards")
 .select(`
 id, front,
 flashcard_reviews (interval, next_review)
 `)
 .eq("user_id", user.id)
 .limit(10);

 if (dueCards) {
 const now = new Date();
 reviewCards = dueCards
 .map((c: any) => {
 const reviews = c.flashcard_reviews || [];
 const latest = reviews.length > 0
 ? reviews.sort((a: any, b: any) => new Date(b.next_review).getTime() - new Date(a.next_review).getTime())[0]
 : null;
 return {
 id: c.id,
 front: c.front,
 interval: latest?.interval ?? 0,
 nextReview: latest?.next_review ?? new Date(0).toISOString(),
 };
 })
 .filter((c: any) => new Date(c.nextReview) <= now)
 .slice(0, 5);
 }

 // Recent lessons (shared)
 const { data: dbLessons } = await supabase
 .from("lessons")
 .select("id, title, description, status")
 .order("created_at", { ascending: false })
 .limit(5);

 if (dbLessons) {
 recentLessons = dbLessons.map((l: any) => ({
 id: l.id,
 title: l.title,
 description: l.description || "",
 status: l.status,
 }));
 }

 // Weekly activity: vocab created + reviews this week
 const weekStart = new Date();
 const currentDay = weekStart.getDay() || 7; // Convert Sunday (0) to 7
 weekStart.setDate(weekStart.getDate() - currentDay + 1); // Monday
 weekStart.setHours(0, 0, 0, 0);

 const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
 const weekMap = new Map<string, { vocabulary: number; reviews: number }>();
 days.forEach((d) => weekMap.set(d, { vocabulary: 0, reviews: 0 }));

 // Vocab created this week (shared)
 const { data: weekVocab } = await supabase
 .from("vocabularies")
 .select("created_at")
 .gte("created_at", weekStart.toISOString());

 if (weekVocab) {
 for (const v of weekVocab) {
 const dayIdx = new Date(v.created_at).getDay();
 const dayName = days[(dayIdx + 6) % 7]; // Adjust: Sunday=0 → index 6
 const entry = weekMap.get(dayName);
 if (entry) entry.vocabulary++;
 }
 }

 // Reviews this week (personal)
 const { data: weekReviews } = await supabase
 .from("flashcard_reviews")
 .select("last_review")
 .eq("user_id", user.id)
 .gte("last_review", weekStart.toISOString());

 if (weekReviews) {
 for (const r of weekReviews) {
 if (!r.last_review) continue;
 const dayIdx = new Date(r.last_review).getDay();
 const dayName = days[(dayIdx + 6) % 7];
 const entry = weekMap.get(dayName);
 if (entry) entry.reviews++;
 }
 }

 weeklyData = days.map((day) => ({
 day,
 vocabulary: weekMap.get(day)?.vocabulary ?? 0,
 reviews: weekMap.get(day)?.reviews ?? 0,
 }));

 // Retention Data
 const { data: allReviews } = await supabase
 .from("flashcard_reviews")
 .select("interval, next_review")
 .eq("user_id", user.id);
 
 if (allReviews) {
 const now = new Date();
 allReviews.forEach(r => {
 if (new Date(r.next_review) <= now) {
 retentionData.needsReview++;
 } else if (r.interval >= 21) {
 retentionData.mastered++;
 } else {
 retentionData.learning++;
 }
 });
 }
 }
 }

 return (
 <div className="space-y-6">
 <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
 <div>
 <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
 <h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1>
 </div>
 <QuickActions />
 </section>
 <StatsCards stats={stats} />
 <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
 <div className="space-y-4">
 <div className="grid gap-4 md:grid-cols-2">
 <Card className="flex flex-col">
 <CardHeader className="pb-2">
 <CardTitle>Weekly activity</CardTitle>
 <CardDescription>Vocabulary added and reviews by day</CardDescription>
 </CardHeader>
 <CardContent className="flex-1 mt-2">
 <WeeklyProgress data={weeklyData} />
 </CardContent>
 </Card>
 <Card className="flex flex-col">
 <CardHeader className="pb-2">
 <CardTitle>Vocabulary Retention</CardTitle>
 <CardDescription>Your spaced repetition learning state</CardDescription>
 </CardHeader>
 <CardContent className="flex-1 mt-2">
 <RetentionChart data={retentionData} />
 </CardContent>
 </Card>
 </div>
 <RecentLessons lessons={recentLessons} />
 </div>
 <div className="space-y-4">
 <DailyQuests quests={questsData} />
 <TodayReview cards={reviewCards} />
 <BadgeShowcase stats={badgeStats} />
 </div>
 </section>
 </div>
 );
}
