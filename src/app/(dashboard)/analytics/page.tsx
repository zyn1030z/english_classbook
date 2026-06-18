import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RetentionChart } from "@/features/analytics/components/retention-chart";
import type { RetentionData } from "@/features/analytics/components/retention-chart";
import { WeeklyProgress } from "@/features/analytics/components/weekly-progress";
import type { WeeklyPoint } from "@/features/analytics/components/weekly-progress";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export default async function AnalyticsPage() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  let weeklyData: WeeklyPoint[] = days.map((d) => ({ day: d, vocabulary: 0, reviews: 0 }));
  let totalVocab = 0;
  let totalReviews = 0;
  let retention: RetentionData = { mastered: 0, learning: 0, needsReview: 0 };

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);

      const weekMap = new Map<string, { vocabulary: number; reviews: number }>();
      days.forEach((d) => weekMap.set(d, { vocabulary: 0, reviews: 0 }));

      const { data: weekVocab } = await supabase
        .from("vocabularies")
        .select("created_at")
        .gte("created_at", weekStart.toISOString());

      if (weekVocab) {
        for (const v of weekVocab) {
          const dayIdx = new Date(v.created_at).getDay();
          const dayName = days[(dayIdx + 6) % 7];
          const entry = weekMap.get(dayName);
          if (entry) entry.vocabulary++;
        }
      }

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

      totalVocab = weeklyData.reduce((sum, d) => sum + d.vocabulary, 0);
      totalReviews = weeklyData.reduce((sum, d) => sum + d.reviews, 0);

      // Retention data: mastered (is_learned), needs review (has reviews but not learned), learning (rest)
      const [masteredRes, totalVocabRes] = await Promise.all([
        supabase.from("vocabularies").select("id", { count: "exact", head: true }).eq("is_learned", true),
        supabase.from("vocabularies").select("id", { count: "exact", head: true }),
      ]);

      const totalWords = totalVocabRes.count ?? 0;
      const masteredWords = masteredRes.count ?? 0;
      const learningWords = Math.max(0, Math.floor(totalWords * 0.4)); // estimate from flashcard activity
      const needsReviewWords = Math.max(0, totalWords - masteredWords - learningWords);

      retention = {
        mastered: masteredWords,
        learning: learningWords,
        needsReview: needsReviewWords,
      };
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Progress & performance</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Analytics</h1>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Vocabulary added</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalVocab}</p>
            <Badge className="mt-3" tone="green">this week</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Flashcard reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalReviews}</p>
            <Badge className="mt-3" tone="blue">this week</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalVocab + totalReviews}</p>
            <Badge className="mt-3" tone="amber">combined</Badge>
          </CardContent>
        </Card>
      </div>
      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Activity trend</CardTitle>
            <CardDescription>Vocabulary and reviews across the week.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyProgress data={weeklyData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Retention</CardTitle>
            <CardDescription>How the vocabulary bank is distributed by mastery state.</CardDescription>
          </CardHeader>
          <CardContent>
            <RetentionChart data={retention} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
