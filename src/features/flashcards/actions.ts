"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export async function submitFlashcardReview(
  flashcardId: string,
  quality: 1 | 3 | 4 | 5,
  easeFactor: number,
  interval: number,
  repetitions: number,
  nextReview: string
) {
  if (!hasSupabaseConfig()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Unauthorized" };
  }

  // Upsert review record with latest SM-2 state
  const { error } = await supabase.from("flashcard_reviews").insert({
    flashcard_id: flashcardId,
    user_id: user.id,
    quality: quality,
    ease_factor: easeFactor,
    interval: interval,
    repetitions: repetitions,
    next_review: nextReview,
    last_review: new Date().toISOString()
  });

  if (error) {
    console.error("[Flashcard Review] Insert failed:", error.message);
    return { ok: false, message: error.message };
  }

  revalidatePath("/flashcards");
  return { ok: true };
}

/**
 * Auto-generate flashcards for current user from all shared vocabularies
 * that don't already have a flashcard for this user.
 */
export async function generateFlashcardsForUser() {
  if (!hasSupabaseConfig()) {
    return { ok: true, created: 0 };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Unauthorized", created: 0 };
  }

  // Get all vocabularies (shared via RLS)
  const { data: allVocabs } = await supabase
    .from("vocabularies")
    .select("id, word, meaning");

  if (!allVocabs || allVocabs.length === 0) {
    return { ok: true, created: 0 };
  }

  // Get existing flashcards for this user
  const { data: existingCards } = await supabase
    .from("flashcards")
    .select("vocabulary_id")
    .eq("user_id", user.id);

  const existingVocabIds = new Set((existingCards || []).map((c) => c.vocabulary_id));

  // Filter vocabularies that don't have flashcards yet
  const newVocabs = allVocabs.filter((v) => !existingVocabIds.has(v.id));

  if (newVocabs.length === 0) {
    return { ok: true, created: 0 };
  }

  // Batch insert flashcards
  const flashcards = newVocabs.map((v) => ({
    vocabulary_id: v.id,
    user_id: user.id,
    front: v.word,
    back: v.meaning,
    mode: "en_vi" as const,
  }));

  const { error } = await supabase.from("flashcards").insert(flashcards);

  if (error) {
    console.error("[Generate Flashcards] Insert failed:", error.message);
    return { ok: false, message: error.message, created: 0 };
  }

  console.log(`[Generate Flashcards] Created ${flashcards.length} flashcards for user ${user.id}`);
  revalidatePath("/flashcards");
  return { ok: true, created: flashcards.length };
}
