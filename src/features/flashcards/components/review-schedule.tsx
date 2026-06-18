import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, CheckCircle2, Clock } from "lucide-react";

interface ScheduleCard {
  id: string;
  front: string;
  nextReview: string;
}

const statusConfig = {
  overdue: { label: "Overdue", icon: AlertCircle, dotClass: "bg-red-500", badgeTone: "red" as const },
  today: { label: "Today", icon: Clock, dotClass: "bg-amber-500", badgeTone: "amber" as const },
  thisWeek: { label: "This week", icon: Calendar, dotClass: "bg-emerald-500", badgeTone: "green" as const },
};

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
    { key: "overdue" as const, items: overdue },
    { key: "today" as const, items: dueToday },
    { key: "thisWeek" as const, items: upcoming },
  ].filter((g) => g.items.length > 0);

  return (
    <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Review schedule</CardTitle>
            <CardDescription className="text-xs">Due, overdue, and upcoming.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No upcoming reviews.</p>
          </div>
        ) : (
          groups.map((group) => {
            const config = statusConfig[group.key];
            const Icon = config.icon;
            return (
              <div key={group.key} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                  <span>{config.label}</span>
                  <Badge tone={config.badgeTone} className="ml-auto text-[10px] px-1.5 py-0 font-bold">
                    {group.items.length}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {group.items.slice(0, 5).map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between rounded-xl border dark:border-white/5 dark:bg-white/[0.02] bg-muted/20 px-3 py-2 transition-colors hover:bg-muted/40 dark:hover:bg-white/5"
                    >
                      <p className="font-medium text-[13px] truncate max-w-[150px]">{card.front}</p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <Clock className="h-3 w-3" />
                        {new Date(card.nextReview).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  ))}
                </div>
                {group.items.length > 5 && (
                  <p className="text-[11px] text-muted-foreground text-center font-medium">
                    +{group.items.length - 5} more
                  </p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
