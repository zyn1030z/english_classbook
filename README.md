# English Learning Notebook

AI-powered notebook for English learners to store lessons, extract vocabulary, review flashcards, keep grammar notes, record speaking practice, and track progress.

## Stack

- Next.js 15 App Router, TypeScript, TailwindCSS
- Supabase Auth, Postgres, Storage, RLS
- Google Gemini for extraction, sentences, quizzes, and speaking prompts
- Zustand for local notebook state, React Query for server state
- Recharts analytics and Vitest tests

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app works with demo data if Supabase and Gemini env variables are empty. Add the env values to persist lessons and enable AI generation.

## Supabase

Apply `supabase/migrations/001_initial_schema.sql`, then run `supabase/seed.sql` for starter grammar topics. Create Storage buckets:

- `lesson-files`
- `speaking-recordings`

Enable Google and GitHub providers in Supabase Auth, then set callback URL:

```text
http://localhost:3000/auth/callback
```

## Main Features

- Dashboard with stats, weekly progress, due reviews, and recent lessons
- Lesson creation, upload entry point, tags, and status workflow
- Vocabulary search, filters, favorites, learned state, and Web Speech pronunciation
- Flashcards with SM-2 scheduling and keyboard review
- Grammar notebook with topic tree and searchable notes
- Speaking practice with prompt generation, MediaRecorder capture, and playback
- Analytics for weekly activity and retention
- Import API that accepts files and runs Gemini extraction when configured

## Tests

```bash
npm run test
```

## Deploy

Use Vercel or Docker. For Docker:

```bash
docker compose up --build
```
