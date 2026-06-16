import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { flashcards } from "@/lib/utils/demo-data";

export function TodayReview() {
  const due = flashcards.filter((card) => new Date(card.nextReview) <= new Date());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s review</CardTitle>
        <CardDescription>{due.length} cards are ready for spaced repetition.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {due.map((card) => (
            <div key={card.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">{card.front}</p>
                <p className="text-sm text-muted-foreground">Interval {card.interval} days</p>
              </div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
        <Button asChild className="w-full">
          <Link href="/flashcards">
            Start review
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
