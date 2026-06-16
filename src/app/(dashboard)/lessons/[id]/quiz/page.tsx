import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuizClient } from "@/features/lessons/components/quiz-client";

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const resolvedParams = await params;
  const lessonId = resolvedParams.id;
  
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select(`
      id,
      quiz_questions (
        id,
        content,
        question_type,
        correct_answer,
        explanation,
        quiz_answers (
          id,
          answer,
          is_correct
        )
      )
    `)
    .eq("lesson_id", lessonId)
    .single();

  if (error || !quiz) {
    console.error("Quiz not found or error:", error);
    return notFound();
  }

  // Format the data
  const questions = quiz.quiz_questions.map((q: any) => ({
    id: q.id,
    content: q.content,
    type: q.question_type,
    correctAnswer: q.correct_answer,
    explanation: q.explanation,
    options: q.quiz_answers.map((a: any) => ({
      id: a.id,
      text: a.answer,
      isCorrect: a.is_correct
    }))
  }));

  return (
    <div className="mx-auto max-w-3xl py-8 flex flex-col h-[calc(100vh-8rem)]">
      <QuizClient quizId={quiz.id} lessonId={lessonId} questions={questions} />
    </div>
  );
}
