import { CalendarDays, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lesson } from "@/types";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{lesson.title}</CardTitle>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {new Date(lesson.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
          <Badge tone={lesson.status === "published" ? "green" : lesson.status === "draft" ? "amber" : "neutral"}>
            {lesson.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{lesson.description}</p>
        <div className="flex flex-wrap gap-2">
          {lesson.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md bg-muted p-3">
            <p className="text-muted-foreground">Vocabulary</p>
            <p className="mt-1 font-semibold">{lesson.vocabularyCount}</p>
          </div>
          <div className="rounded-md bg-muted p-3">
            <p className="text-muted-foreground">Grammar</p>
            <p className="mt-1 font-semibold">{lesson.grammarCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          Text extraction ready
        </div>
      </CardContent>
    </Card>
  );
}
