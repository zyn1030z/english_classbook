"use server";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

/**
 * Calculate streak: consecutive days with at least 1 activity
 * (quiz attempt, flashcard review, or vocab added).
 * Returns number of consecutive days up to today.
 */
export async function calculateStreak(userId: string): Promise<number> {
  if (!hasSupabaseConfig()) return 0;
  const supabase = await createClient();

  // Collect activity dates from 3 sources (last 90 days)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffISO = cutoff.toISOString();

  const [quizRes, reviewRes, vocabRes] = await Promise.all([
    supabase
      .from("quiz_attempts")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", cutoffISO),
    supabase
      .from("flashcard_reviews")
      .select("last_review")
      .eq("user_id", userId)
      .gte("last_review", cutoffISO),
    supabase
      .from("vocabularies")
      .select("created_at")
      .gte("created_at", cutoffISO),
  ]);

  // Collect unique date strings (YYYY-MM-DD)
  const activeDates = new Set<string>();

  const toDateStr = (d: string) => new Date(d).toISOString().split("T")[0];

  if (quizRes.data) quizRes.data.forEach((r: any) => activeDates.add(toDateStr(r.created_at)));
  if (reviewRes.data) reviewRes.data.forEach((r: any) => { if (r.last_review) activeDates.add(toDateStr(r.last_review)); });
  if (vocabRes.data) vocabRes.data.forEach((r: any) => activeDates.add(toDateStr(r.created_at)));

  if (activeDates.size === 0) return 0;

  // Count consecutive days backward from today
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 90; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];

    if (activeDates.has(dateStr)) {
      streak++;
    } else if (i === 0) {
      // Today has no activity yet — still count yesterday's streak
      continue;
    } else {
      break;
    }
  }

  return streak;
}
