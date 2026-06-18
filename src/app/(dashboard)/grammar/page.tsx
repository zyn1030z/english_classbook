import { GrammarNotebook } from "@/features/grammar/components/grammar-notebook";
import { grammarNotes as demoNotes, grammarTopics as demoTopics } from "@/lib/utils/demo-data";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { GrammarTopic, GrammarNote } from "@/types";

export default async function GrammarPage() {
  let topics: GrammarTopic[] = demoTopics;
  let notes: GrammarNote[] = demoNotes;

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const [topicsRes, notesRes] = await Promise.all([
        supabase
          .from("grammar_topics")
          .select("id, name, level, description, parent_id")
          .order("name"),
        supabase
          .from("grammar_notes")
          .select("id, user_id, topic_id, lesson_id, title, explanation, examples, notes, lessons(title, created_at)")
          .order("created_at", { ascending: false }),
      ]);

      if (notesRes.data) {
        notes = notesRes.data.map((n: any) => ({
          id: n.id,
          userId: n.user_id,
          topicId: n.topic_id,
          lessonId: n.lesson_id || undefined,
          lessonTitle: n.lessons?.title || undefined,
          lessonCreatedAt: n.lessons?.created_at || undefined,
          title: n.title,
          explanation: n.explanation,
          examples: n.examples || [],
          notes: n.notes || "",
        }));
      }

      // Only include topics that have at least one note
      const topicIdsWithNotes = new Set(notes.map((n) => n.topicId));

      if (topicsRes.data) {
        topics = topicsRes.data
          .filter((t: any) => topicIdsWithNotes.has(t.id))
          .map((t: any) => ({
            id: t.id,
            name: t.name,
            level: t.level,
            description: t.description || "",
            parentId: t.parent_id || undefined,
          }));
      }
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Topics, rules & examples</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Grammar Notes</h1>
      </section>
      <GrammarNotebook topics={topics} notes={notes} />
    </div>
  );
}
