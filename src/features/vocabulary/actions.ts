"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export async function toggleVocabularyFavorite(id: string, isFavorite: boolean) {
 if (!hasSupabaseConfig()) {
 return { ok: true };
 }

 const supabase = await createClient();
 const { error } = await supabase
 .from("vocabularies")
 .update({ is_favorite: isFavorite })
 .eq("id", id);

 if (error) {
 return { ok: false, message: error.message };
 }

 revalidatePath("/vocabulary");
 return { ok: true };
}

export async function toggleVocabularyLearned(id: string, isLearned: boolean) {
 if (!hasSupabaseConfig()) {
 return { ok: true };
 }

 const supabase = await createClient();
 const { error } = await supabase
 .from("vocabularies")
 .update({ is_learned: isLearned })
 .eq("id", id);

 if (error) {
 return { ok: false, message: error.message };
 }

 revalidatePath("/vocabulary");
 return { ok: true };
}
