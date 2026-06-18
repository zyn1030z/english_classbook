import Link from "next/link";
import { BookOpen } from "lucide-react";
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
    <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md">
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
          lessons.map((lesson) => (
            <Link key={lesson.id} href="/lessons" className="block rounded-md border dark:border-white/10 p-3 transition-colors hover:bg-muted dark:hover:bg-black/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{lesson.description}</p>
                </div>
                <Badge tone={lesson.status === "published" ? "green" : "amber"}>{lesson.status}</Badge>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
