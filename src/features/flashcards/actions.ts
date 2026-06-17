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
