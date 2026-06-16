import { LessonForm } from "@/features/lessons/components/lesson-form";
import { LessonList } from "@/features/lessons/components/lesson-list";
import { lessons } from "@/lib/utils/demo-data";

export default function LessonsPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Lesson library</p>
        <h1 className="mt-1 text-3xl font-semibold">Organize every English lesson</h1>
      </section>
      <LessonForm />
      <LessonList lessons={lessons} />
    </div>
  );
}
