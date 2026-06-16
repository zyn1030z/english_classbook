"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

const lessonSchema = z.object({
  title: z.string().min(2),
  description: z.string().default(""),
  tags: z.string().default(""),
  status: z.enum(["draft", "published", "archived"]).default("draft")
});

export async function createLesson(formData: FormData) {
  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    tags: formData.get("tags"),
    status: formData.get("status") || "draft"
  });

  if (!parsed.success) {
    return;
  }

  if (!hasSupabaseConfig()) {
    revalidatePath("/lessons");
    return;
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    return;
  }

  const { error } = await supabase.from("lessons").insert({
    user_id: userId,
    title: parsed.data.title,
    description: parsed.data.description,
    tags: parsed.data.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    status: parsed.data.status
  });

  if (error) return;

  revalidatePath("/lessons");
}

export async function updateLessonStatus(id: string, status: "draft" | "published" | "archived") {
  if (!hasSupabaseConfig()) {
    revalidatePath("/lessons");
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("lessons").update({ status }).eq("id", id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/lessons");
  return { ok: true };
}
