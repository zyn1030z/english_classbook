-- Performance indexes for common query patterns
-- Fixes slow flashcard and lesson page loads

-- Flashcards: page queries WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id
  ON public.flashcards (user_id);

-- Lessons: page queries WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_lessons_user_created
  ON public.lessons (user_id, created_at DESC);

-- Vocabularies: page queries WHERE user_id = ? with relation joins
CREATE INDEX IF NOT EXISTS idx_vocabularies_lesson_id
  ON public.vocabularies (lesson_id);

-- Grammar notes: count queries per lesson
CREATE INDEX IF NOT EXISTS idx_grammar_notes_lesson_id
  ON public.grammar_notes (lesson_id);
