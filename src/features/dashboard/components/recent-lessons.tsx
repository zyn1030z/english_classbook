import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface RecentLesson {
  id: string;
  title: string;
  description: string;
  status: string;
}

export function RecentLessons({ lessons }: { lessons: RecentLesson[] }) {
  return (
    <Card className=" shadow-md">
      <CardHeader>
        <CardTitle>Recent lessons</CardTitle>
        <CardDescription>Your latest imported and created lessons.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No lessons yet. Create your first lesson!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {lessons.map((lesson) => (
              <Link 
                key={lesson.id} 
                href={`/lessons/${lesson.id}`} 
                className="group flex items-center justify-between rounded-xl border border-transparent dark:hover:border-white/5 p-3 transition-all duration-300 hover:bg-muted/50 dark:hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground transition-colors">{lesson.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 max-w-[200px] sm:max-w-[300px]">
                      {lesson.description || "No description provided."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    tone={lesson.status === "published" ? "green" : "amber"}
                    className="hidden sm:inline-flex"
                  >
                    {lesson.status}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
