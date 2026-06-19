"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not authenticated" };

  const name = formData.get("name") as string;
  const englishLevel = formData.get("englishLevel") as string;
  const learningGoal = formData.get("learningGoal") as string;

  // Update core fields (guaranteed to exist)
  const updatePayload: Record<string, string> = { name, english_level: englishLevel };

  // Attempt learning_goal if column exists
  if (learningGoal !== null && learningGoal !== undefined) {
    updatePayload.learning_goal = learningGoal;
  }

  const { error } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("id", user.id);

  if (error) {
    // If learning_goal column doesn't exist, retry without it
    if (error.message?.includes("learning_goal")) {
      const { error: retryError } = await supabase
        .from("users")
        .update({ name, english_level: englishLevel })
        .eq("id", user.id);
      if (retryError) {
        console.error("Update profile retry error:", retryError);
        return { ok: false, message: retryError.message };
      }
    } else {
      console.error("Update profile error:", error);
      return { ok: false, message: error.message };
    }
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true, message: "Profile updated successfully" };
}

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, email, english_level, streak_count, theme_preference, created_at")
    .eq("id", user.id)
    .single();

  // Get stats
  const [vocabRes, lessonRes, quizRes, bestScoreRes, masteredRes, reviewCountRes] = await Promise.all([
    supabase.from("vocabularies").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("lessons").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("quizzes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("quiz_attempts").select("score").eq("user_id", user.id).order("score", { ascending: false }).limit(1),
    supabase.from("flashcard_reviews").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("interval", 21),
    supabase.from("flashcard_reviews").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  return {
    ...profile,
    email: profile?.email || user.email || "",
    name: profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
    englishLevel: profile?.english_level || "A2",
    learningGoal: (profile as any)?.learning_goal || "",
    themePreference: (profile as any)?.theme_preference || "system",
    streakCount: profile?.streak_count || 0,
    createdAt: profile?.created_at || user.created_at,
    stats: {
      vocabCount: vocabRes.count || 0,
      lessonCount: lessonRes.count || 0,
      quizCount: quizRes.count || 0,
      bestQuizScore: bestScoreRes.data?.[0]?.score || 0,
      flashcardMastered: masteredRes.count || 0,
      totalReviews: reviewCountRes.count || 0,
    },
  };
}

export async function saveThemePreference(theme: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("users")
    .update({ theme_preference: theme })
    .eq("id", user.id);

  if (error) {
    // Column may not exist yet — silently fail
    console.error("[Theme] Save error:", error.message);
    return { ok: false };
  }

  return { ok: true };
}
