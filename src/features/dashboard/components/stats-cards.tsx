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
  {
    iconClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    bgAccent: "from-amber-500/5 to-transparent"
  },
  {
    iconClass: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    bgAccent: "from-blue-500/5 to-transparent"
  },
  {
    iconClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    bgAccent: "from-emerald-500/5 to-transparent"
  },
  {
    iconClass: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    bgAccent: "from-rose-500/5 to-transparent"
  }
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
        const colors = colorConfigs[index] ?? colorConfigs[0];

        return (
          <Card
            key={metric.label}
            className="group relative overflow-hidden shadow-md hover:bg-card/90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
              colors.bgAccent
            )} />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2.5">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                {metric.label}
              </CardTitle>
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-105",
                colors.iconClass
              )}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {metric.value}
              </div>
              <Badge className="mt-2 text-[10px] font-medium" tone="green">
                {metric.trend}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
