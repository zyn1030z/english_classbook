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

  // Khởi tạo bài học trong DB
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .insert({
      user_id: userId,
      title: parsed.data.title,
      description: parsed.data.description,
      tags: parsed.data.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      status: parsed.data.status
    })
    .select("id")
    .single();

  if (lessonError) {
    console.error("Error creating lesson:", lessonError.message);
    return;
  }

  // Xử lý tệp tải lên nếu có
  const file = formData.get("file") as File | null;
  if (file && file.size > 0 && lesson) {
    try {
      // Tự động tạo bucket nếu chưa tồn tại
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === "lesson-files");
      if (!bucketExists) {
        await supabase.storage.createBucket("lesson-files", {
          public: false,
          fileSizeLimit: 10485760 // 10MB
        });
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/${lesson.id}/${Date.now()}.${fileExt}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from("lesson-files")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true
        });

      if (storageError) {
        console.error("Storage upload error:", storageError.message);
      } else if (storageData) {
        // Lưu thông tin tệp vào bảng lesson_files
        const { error: fileDbError } = await supabase
          .from("lesson_files")
          .insert({
            lesson_id: lesson.id,
            file_name: file.name,
            file_path: storageData.path,
            file_size: file.size,
            mime_type: file.type
          });
        
        if (fileDbError) {
          console.error("Database error saving file info:", fileDbError.message);
        }
      }
    } catch (e: any) {
      console.error("Unexpected error during file upload:", e.message);
    }
  }

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
