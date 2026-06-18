import { LessonForm } from "@/features/lessons/components/lesson-form";
import { LessonList } from "@/features/lessons/components/lesson-list";
import { checkIsAdmin } from "@/features/lessons/actions";
import { lessons as demoLessons } from "@/lib/utils/demo-data";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { Lesson } from "@/types";

export default async function LessonsPage() {
  let activeLessons: Lesson[] = demoLessons;
  const adminStatus = await checkIsAdmin();

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: dbLessons } = await supabase
        .from("lessons")
        .select(`
          *,
          vocabularies:vocabularies(count),
          grammar_notes:grammar_notes(count)
        `)
        .order("created_at", { ascending: false });

      if (dbLessons) {
        activeLessons = dbLessons.map((l: any) => ({
          id: l.id,
          userId: l.user_id,
          title: l.title,
          description: l.description || "",
          date: l.created_at,
          tags: l.tags || [],
          status: l.status,
          vocabularyCount: l.vocabularies?.[0]?.count || 0,
          grammarCount: l.grammar_notes?.[0]?.count || 0
        }));
      }
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Your learning content</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">My Lessons</h1>
      </section>
      {adminStatus && <LessonForm />}
      <LessonList lessons={activeLessons} isAdmin={adminStatus} />
    </div>
  );
}
