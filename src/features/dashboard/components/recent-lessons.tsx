import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { lessons } from "@/lib/utils/demo-data";

export function RecentLessons() {
  return (
    <Card className="dark:border-white/10 dark:bg-[#161616] shadow-md">
      <CardHeader>
        <CardTitle>Recent lessons</CardTitle>
        <CardDescription>Your latest imported and manually created lessons.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {lessons.slice(0, 5).map((lesson) => (
          <Link key={lesson.id} href="/lessons" className="block rounded-md border dark:border-white/10 p-3 transition-colors hover:bg-muted dark:hover:bg-black/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{lesson.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>
              </div>
              <Badge tone={lesson.status === "published" ? "green" : "amber"}>{lesson.status}</Badge>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
