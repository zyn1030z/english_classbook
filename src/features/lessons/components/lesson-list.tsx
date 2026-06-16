import { LessonCard } from "@/features/lessons/components/lesson-card";
import type { Lesson } from "@/types";

export function LessonList({ lessons }: { lessons: Lesson[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {lessons.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
}
