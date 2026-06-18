import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonDetailClient } from "@/features/lessons/components/lesson-detail-client";

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const resolvedParams = await params;
  const lessonId = resolvedParams.id;

  // Fetch lesson
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, title, description, date, tags, status")
    .eq("id", lessonId)
    .single();

  if (lessonError || !lesson) return notFound();

  // Fetch vocabularies
  const { data: vocabularies } = await supabase
    .from("vocabularies")
    .select("id, word, meaning, ipa, part_of_speech, category, difficulty, is_learned, is_favorite")
    .eq("lesson_id", lessonId)
    .order("word", { ascending: true });

  // Fetch grammar notes
  const { data: grammarNotes } = await supabase
    .from("grammar_notes")
    .select("id, title, explanation, examples, notes")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: true });

  // Fetch attached file
  const { data: lessonFile } = await supabase
    .from("lesson_files")
    .select("id, file_name, file_type, created_at")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  // Fetch quiz stats
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, created_at, quiz_questions(id)")
    .eq("lesson_id", lessonId)
    .eq("quiz_type", "lesson_review")
    .maybeSingle();

  return (
    <LessonDetailClient
      lesson={{
        ...lesson,
        tags: lesson.tags || [],
      }}
      vocabularies={vocabularies || []}
      grammarNotes={(grammarNotes || []).map((g: any) => ({
        ...g,
        examples: g.examples || [],
      }))}
      lessonFile={lessonFile}
      quizInfo={quiz ? { id: quiz.id, questionCount: quiz.quiz_questions?.length || 0, createdAt: quiz.created_at } : null}
    />
  );
}
