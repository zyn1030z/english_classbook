import { BookOpen, Flame, Mic2, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export interface StatsData {
 lessonCount: number;
 vocabCount: number;
 flashcardDue: number;
 streakDays: number;
}

const colorConfigs = [
  { iconClass: "text-muted-foreground" },
  { iconClass: "text-muted-foreground" },
  { iconClass: "text-muted-foreground" },
  { iconClass: "text-muted-foreground" }
];

export function StatsCards({ stats }: { stats: StatsData }) {
 const metrics = [
 { label: "Lessons", value: String(stats.lessonCount), trend: `${stats.lessonCount} total`, icon: Trophy },
 { label: "Vocabulary", value: String(stats.vocabCount), trend: `${stats.flashcardDue} due today`, icon: BookOpen },
 { label: "Flashcards Due", value: String(stats.flashcardDue), trend: "ready for review", icon: Mic2 },
 { label: "Streak", value: String(stats.streakDays), trend: `${stats.streakDays} days`, icon: Flame },
 ];

 return (
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 {metrics.map((metric, index) => {
 const Icon = metric.icon;

 return (
  <Card
  key={metric.label}
  >
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  <CardTitle className="text-sm font-medium">
  {metric.label}
  </CardTitle>
  <Icon className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
  <div className="text-2xl font-bold">
  {metric.value}
  </div>
  <p className="text-xs text-muted-foreground mt-1">
  {metric.trend}
  </p>
  </CardContent>
 </Card>
 );
 })}
 </div>
 );
}
