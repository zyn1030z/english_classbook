import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { flashcards } from "@/lib/utils/demo-data";

export function ReviewSchedule() {
  return (
    <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md">
      <CardHeader>
        <CardTitle>Review schedule</CardTitle>
        <CardDescription>Due, overdue, and upcoming flashcards for the next sessions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {flashcards.map((card) => {
          const date = new Date(card.nextReview);
          const overdue = date <= new Date();
          return (
            <div key={card.id} className="flex items-center justify-between rounded-md border dark:border-white/10 dark:bg-black/20 p-3">
              <div>
                <p className="font-medium">{card.front}</p>
                <p className="text-sm text-muted-foreground">{date.toLocaleDateString()}</p>
              </div>
              <Badge tone={overdue ? "red" : "green"}>{overdue ? "due" : "upcoming"}</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
