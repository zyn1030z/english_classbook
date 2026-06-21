import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ReviewCard {
 id: string;
 front: string;
 interval: number;
}

export function TodayReview({ cards }: { cards: ReviewCard[] }) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Today&apos;s review</CardTitle>
 <CardDescription>{cards.length} cards are ready for spaced repetition.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 {cards.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-6 text-center">
 <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
 <p className="text-sm text-muted-foreground">All caught up! No cards due.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {cards.slice(0, 5).map((card) => (
 <div key={card.id} className="flex items-center justify-between rounded-md border p-3">
 <div>
 <p className="font-medium">{card.front}</p>
 <p className="text-sm text-muted-foreground">Interval {card.interval} days</p>
 </div>
 <Clock className="h-4 w-4 text-muted-foreground" />
 </div>
 ))}
 {cards.length > 5 && (
 <p className="text-xs text-center text-muted-foreground">+{cards.length - 5} more cards</p>
 )}
 </div>
 )}
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
