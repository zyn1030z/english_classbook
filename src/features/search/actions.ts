"use server";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export type SearchResult = {
  lessons: { id: string; title: string; description: string; date: string }[];
  vocabularies: { id: string; word: string; meaning: string; lesson_id: string }[];
  grammarNotes: { id: string; title: string; lesson_id: string }[];
};

export async function globalSearch(query: string): Promise<SearchResult> {
  const empty: SearchResult = { lessons: [], vocabularies: [], grammarNotes: [] };
  if (!query || query.length < 2) return empty;
  if (!hasSupabaseConfig()) return empty;

  const supabase = await createClient();
  const pattern = `%${query}%`;

  const [lessonsRes, vocabRes, grammarRes] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, title, description, date")
      .ilike("title", pattern)
      .eq("status", "published")
      .limit(5),
    supabase
      .from("vocabularies")
      .select("id, word, meaning, lesson_id")
      .or(`word.ilike.${pattern},meaning.ilike.${pattern}`)
      .limit(5),
    supabase
      .from("grammar_notes")
      .select("id, title, lesson_id")
      .ilike("title", pattern)
      .limit(5),
  ]);

  return {
    lessons: lessonsRes.data || [],
    vocabularies: vocabRes.data || [],
    grammarNotes: grammarRes.data || [],
  };
}
