-- =============================================================
-- Share educational content across all authenticated users
-- Lessons, Vocabularies, Example Sentences, Grammar Notes
-- are readable by ALL logged-in users.
-- Only the OWNER can insert/update/delete.
-- Flashcards & reviews remain PERSONAL.
-- =============================================================

-- Drop existing restrictive policies
drop policy if exists "lessons owner" on public.lessons;
drop policy if exists "vocab owner" on public.vocabularies;
drop policy if exists "notes owner" on public.grammar_notes;

-- LESSONS: all authenticated users can read, only owner can write
create policy "lessons read all" on public.lessons
  for select using (auth.role() = 'authenticated');

create policy "lessons write owner" on public.lessons
  for insert with check (auth.uid() = user_id);

create policy "lessons update owner" on public.lessons
  for update using (auth.uid() = user_id);

create policy "lessons delete owner" on public.lessons
  for delete using (auth.uid() = user_id);

-- VOCABULARIES: all authenticated users can read, only owner can write
drop policy if exists "vocab owner" on public.vocabularies;

create policy "vocab read all" on public.vocabularies
  for select using (auth.role() = 'authenticated');

create policy "vocab write owner" on public.vocabularies
  for insert with check (auth.uid() = user_id);

create policy "vocab update owner" on public.vocabularies
  for update using (auth.uid() = user_id);

create policy "vocab delete owner" on public.vocabularies
  for delete using (auth.uid() = user_id);

-- GRAMMAR NOTES: all authenticated users can read, only owner can write
drop policy if exists "notes owner" on public.grammar_notes;

create policy "grammar_notes read all" on public.grammar_notes
  for select using (auth.role() = 'authenticated');

create policy "grammar_notes write owner" on public.grammar_notes
  for insert with check (auth.uid() = user_id);

create policy "grammar_notes update owner" on public.grammar_notes
  for update using (auth.uid() = user_id);

create policy "grammar_notes delete owner" on public.grammar_notes
  for delete using (auth.uid() = user_id);

-- EXAMPLE SENTENCES: follow vocabulary access pattern
-- example_sentences doesn't have user_id, access is through vocabulary FK
-- If vocabulary is readable, example sentences should be too

-- LESSON FILES: readable by all authenticated users
drop policy if exists "lesson files through lesson" on public.lesson_files;

create policy "lesson_files read all" on public.lesson_files
  for select using (auth.role() = 'authenticated');

create policy "lesson_files write" on public.lesson_files
  for insert with check (
    exists (select 1 from public.lessons where id = lesson_id and user_id = auth.uid())
  );

create policy "lesson_files delete" on public.lesson_files
  for delete using (
    exists (select 1 from public.lessons where id = lesson_id and user_id = auth.uid())
  );

-- FLASHCARDS: remain PERSONAL (no changes)
-- FLASHCARD REVIEWS: remain PERSONAL (no changes)
-- USER SETTINGS: remain PERSONAL (no changes)
