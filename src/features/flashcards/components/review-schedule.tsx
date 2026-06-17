import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface ScheduleCard {
  id: string;
  front: string;
  nextReview: string;
}

export function ReviewSchedule({ cards }: { cards: ScheduleCard[] }) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const overdue = cards.filter((c) => new Date(c.nextReview) < today);
  const dueToday = cards.filter((c) => {
    const d = new Date(c.nextReview);
    return d >= today && d < tomorrow;
  });
  const upcoming = cards.filter((c) => {
    const d = new Date(c.nextReview);
    return d >= tomorrow && d < nextWeek;
  });

  const groups = [
    { label: "Overdue", items: overdue, tone: "red" as const, icon: "🔴" },
    { label: "Today", items: dueToday, tone: "amber" as const, icon: "🟡" },
    { label: "This week", items: upcoming, tone: "green" as const, icon: "🟢" },
  ].filter((g) => g.items.length > 0);

  return (
    <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Review schedule</CardTitle>
        </div>
        <CardDescription>Due, overdue, and upcoming flashcards.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm text-muted-foreground">No upcoming reviews!</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                <span>{group.icon}</span>
                <span>{group.label}</span>
                <Badge tone={group.tone} className="ml-auto text-[10px] px-1.5 py-0">
                  {group.items.length}
                </Badge>
              </div>
              {group.items.slice(0, 5).map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between rounded-lg border dark:border-white/10 dark:bg-black/20 px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <p className="font-medium text-sm truncate max-w-[160px]">{card.front}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(card.nextReview).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {group.items.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{group.items.length - 5} more
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
