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
  let quizAttempts = 0;
  let avgQuizScore = 0;
  let bestQuizScore = 0;

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

      // Real retention: mastered = is_learned, learning = has flashcard but not learned, needsReview = rest
      const [masteredRes, totalVocabRes, hasFlashcardRes] = await Promise.all([
        supabase.from("vocabularies").select("id", { count: "exact", head: true }).eq("is_learned", true),
        supabase.from("vocabularies").select("id", { count: "exact", head: true }),
        supabase.from("flashcards").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      const totalWords = totalVocabRes.count ?? 0;
      const masteredWords = masteredRes.count ?? 0;
      const learningWords = Math.min((hasFlashcardRes.count ?? 0), totalWords - masteredWords);
      const needsReviewWords = Math.max(0, totalWords - masteredWords - learningWords);

      retention = {
        mastered: masteredWords,
        learning: learningWords,
        needsReview: needsReviewWords,
      };

      // Quiz stats from quiz_attempts
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("score, total_questions")
        .eq("user_id", user.id);

      if (attempts && attempts.length > 0) {
        quizAttempts = attempts.length;
        const scores = attempts.map((a: any) => Math.round((a.score / a.total_questions) * 100));
        avgQuizScore = Math.round(scores.reduce((s: number, v: number) => s + v, 0) / scores.length);
        bestQuizScore = Math.max(...scores);
      }
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Progress & performance</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Analytics</h1>
      </section>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
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
            <CardTitle>Quiz attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{quizAttempts}</p>
            <Badge className="mt-3" tone="amber">all time</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg quiz score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{avgQuizScore}%</p>
            <Badge className="mt-3" tone={avgQuizScore >= 70 ? "green" : "amber"}>average</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Best score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{bestQuizScore}%</p>
            <Badge className="mt-3" tone="green">personal best</Badge>
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
