import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RetentionChart } from "@/features/analytics/components/retention-chart";
import { WeeklyProgress } from "@/features/analytics/components/weekly-progress";
import { weeklyProgress } from "@/lib/utils/demo-data";

export default function AnalyticsPage() {
  const totals = weeklyProgress.reduce(
    (acc, item) => ({
      vocabulary: acc.vocabulary + item.vocabulary,
      lessons: acc.lessons + item.lessons,
      speaking: acc.speaking + item.speaking
    }),
    { vocabulary: 0, lessons: 0, speaking: 0 }
  );

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Learning analytics</p>
        <h1 className="mt-1 text-3xl font-semibold">Track progress and retention</h1>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Vocabulary learned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totals.vocabulary}</p>
            <Badge className="mt-3" tone="green">this week</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lessons completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totals.lessons}</p>
            <Badge className="mt-3" tone="blue">steady pace</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Speaking minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totals.speaking}</p>
            <Badge className="mt-3" tone="amber">fluency work</Badge>
          </CardContent>
        </Card>
      </div>
      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Activity trend</CardTitle>
            <CardDescription>Vocabulary and speaking minutes across the week.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyProgress />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Retention</CardTitle>
            <CardDescription>How the vocabulary bank is distributed by mastery state.</CardDescription>
          </CardHeader>
          <CardContent>
            <RetentionChart />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
