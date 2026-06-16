create extension if not exists "pgcrypto";

create type english_level as enum ('A1', 'A2', 'B1', 'B2');
create type lesson_status as enum ('draft', 'published', 'archived');
create type difficulty as enum ('easy', 'medium', 'hard');
create type flashcard_mode as enum ('en_vi', 'vi_en', 'word_example', 'pronunciation');
create type processing_status as enum ('queued', 'processing', 'completed', 'failed');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar_url text,
  english_level english_level default 'A2',
  learning_goal text default '',
  streak_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  daily_goal_minutes integer default 20,
  review_target integer default 25,
  theme text default 'system',
  unique(user_id)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text default '',
  date date default current_date,
  tags text[] default '{}',
  status lesson_status default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.lesson_files (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  file_url text not null,
  file_type text not null,
  extracted_text text,
  processing_status processing_status default 'queued',
  created_at timestamptz default now()
);

create table public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  file_name text not null,
  file_type text not null,
  status processing_status default 'queued',
  result jsonb default '{}'::jsonb,
  error_message text,
  created_at timestamptz default now()
);

create table public.vocabularies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  word text not null,
  meaning text not null,
  ipa text default '',
  part_of_speech text default '',
  category text default '',
  difficulty difficulty default 'medium',
  is_learned boolean default false,
  is_favorite boolean default false,
  created_at timestamptz default now()
);

create table public.example_sentences (
  id uuid primary key default gen_random_uuid(),
  vocabulary_id uuid not null references public.vocabularies(id) on delete cascade,
  sentence text not null,
  translation text default '',
  difficulty difficulty default 'medium',
  grammar_explanation text
);

create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  vocabulary_id uuid not null references public.vocabularies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  front text not null,
  back text not null,
  mode flashcard_mode default 'en_vi',
  created_at timestamptz default now()
);

create table public.flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  ease_factor numeric(3,2) default 2.50,
  interval integer default 0,
  repetitions integer default 0,
  quality integer check (quality between 0 and 5),
  next_review timestamptz default now(),
  last_review timestamptz
);

create table public.grammar_topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level english_level default 'A2',
  description text default '',
  parent_id uuid references public.grammar_topics(id) on delete cascade
);

create table public.grammar_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  topic_id uuid references public.grammar_topics(id) on delete set null,
  title text not null,
  explanation text not null,
  examples text[] default '{}',
  notes text default '',
  created_at timestamptz default now()
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  grammar_topic_id uuid references public.grammar_topics(id) on delete set null,
  quiz_type text not null,
  difficulty difficulty default 'medium',
  score numeric(5,2),
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_type text not null,
  content text not null,
  correct_answer text not null,
  explanation text default ''
);

create table public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  answer text not null,
  is_correct boolean default false,
  created_at timestamptz default now()
);

create table public.speaking_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  topic text not null,
  duration_seconds integer default 0,
  questions text[] default '{}',
  created_at timestamptz default now()
);

create table public.speaking_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.speaking_sessions(id) on delete cascade,
  question_index integer not null,
  audio_url text not null,
  duration integer default 0,
  created_at timestamptz default now()
);

create table public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null default current_date,
  vocab_learned integer default 0,
  vocab_reviewed integer default 0,
  lessons_completed integer default 0,
  quiz_score_avg numeric(5,2),
  speaking_minutes integer default 0,
  unique(user_id, date)
);

create table public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_activity_date date,
  unique(user_id)
);

create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  feature text not null,
  prompt text not null,
  response jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.user_settings enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_files enable row level security;
alter table public.import_jobs enable row level security;
alter table public.vocabularies enable row level security;
alter table public.example_sentences enable row level security;
alter table public.flashcards enable row level security;
alter table public.flashcard_reviews enable row level security;
alter table public.grammar_topics enable row level security;
alter table public.grammar_notes enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.speaking_sessions enable row level security;
alter table public.speaking_records enable row level security;
alter table public.learning_progress enable row level security;
alter table public.streaks enable row level security;
alter table public.ai_generations enable row level security;

create policy "users own profile" on public.users for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "public grammar topics readable" on public.grammar_topics for select using (true);

create policy "settings owner" on public.user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lessons owner" on public.lessons for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "imports owner" on public.import_jobs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "vocab owner" on public.vocabularies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cards owner" on public.flashcards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reviews owner" on public.flashcard_reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes owner" on public.grammar_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "quizzes owner" on public.quizzes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sessions owner" on public.speaking_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress owner" on public.learning_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "streak owner" on public.streaks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "generation owner" on public.ai_generations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "lesson files through lesson" on public.lesson_files for all
using (exists (select 1 from public.lessons l where l.id = lesson_id and l.user_id = auth.uid()))
with check (exists (select 1 from public.lessons l where l.id = lesson_id and l.user_id = auth.uid()));

create policy "examples through vocab" on public.example_sentences for all
using (exists (select 1 from public.vocabularies v where v.id = vocabulary_id and v.user_id = auth.uid()))
with check (exists (select 1 from public.vocabularies v where v.id = vocabulary_id and v.user_id = auth.uid()));

create policy "questions through quiz" on public.quiz_questions for all
using (exists (select 1 from public.quizzes q where q.id = quiz_id and q.user_id = auth.uid()))
with check (exists (select 1 from public.quizzes q where q.id = quiz_id and q.user_id = auth.uid()));

create policy "answers through question" on public.quiz_answers for all
using (
  exists (
    select 1 from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    where qq.id = question_id and q.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    where qq.id = question_id and q.user_id = auth.uid()
  )
);

create policy "records through session" on public.speaking_records for all
using (exists (select 1 from public.speaking_sessions s where s.id = session_id and s.user_id = auth.uid()))
with check (exists (select 1 from public.speaking_sessions s where s.id = session_id and s.user_id = auth.uid()));

create index lessons_user_id_idx on public.lessons(user_id);
create index vocab_user_id_idx on public.vocabularies(user_id);
create index flashcard_reviews_next_review_idx on public.flashcard_reviews(user_id, next_review);
create index progress_user_date_idx on public.learning_progress(user_id, date);
