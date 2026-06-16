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

  // Cập nhật flashcard state
  const { error: updateError } = await supabase
    .from("flashcards")
    .update({
      ease_factor: easeFactor,
      interval: interval,
      repetitions: repetitions,
      next_review: nextReview
    })
    .eq("id", flashcardId)
    .eq("user_id", user.id);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  // Ghi log review
  await supabase.from("flashcard_reviews").insert({
    flashcard_id: flashcardId,
    quality: quality,
    ease_factor: easeFactor,
    interval: interval,
    repetitions: repetitions,
    user_id: user.id
  });

  revalidatePath("/flashcards");
  return { ok: true };
}
