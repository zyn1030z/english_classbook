import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Vocabulary } from "@/types";

export function VocabularyCards({ vocabularies }: { vocabularies: Vocabulary[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {vocabularies.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{item.word}</CardTitle>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{item.ipa}</p>
              </div>
              {item.isFavorite ? <Star className="h-4 w-4 fill-secondary text-secondary" /> : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium">{item.meaning}</p>
            <p className="text-sm text-muted-foreground">{item.examples[0]?.sentence}</p>
            <div className="flex flex-wrap gap-2">
              <Badge>{item.partOfSpeech}</Badge>
              <Badge tone={item.isLearned ? "green" : "amber"}>{item.isLearned ? "learned" : "review"}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
