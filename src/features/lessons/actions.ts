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

      // Khởi tạo Supabase Admin Client để vượt qua RLS (Row Level Security) khi upload Storage
      const { createClient: createAdminClient } = await import("@supabase/supabase-js");
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: storageData, error: storageError } = await supabaseAdmin.storage
        .from("lesson-files")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true
        });

      if (storageError) {
        console.error("Storage upload error:", storageError.message);
      } else if (storageData) {
        // Lưu thông tin tệp vào bảng lesson_files
        const { error: fileDbError } = await supabaseAdmin
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

      // ================= AI EXTRACTION PHASE =================
      // Tách biệt hoàn toàn khỏi kết quả Upload Storage để đảm bảo tính sẵn sàng cao
      try {
        const { extractTextFromFile } = await import("@/lib/utils/file-parser");
        const rawText = await extractTextFromFile(file);
        console.log("Raw text length:", rawText?.length);
        
        if (rawText && rawText.length > 50) {
          const aiProvider = process.env.AI_PROVIDER || "gemini";
          console.log(`Starting AI extraction with provider: ${aiProvider}`);
          let aiData = null;
          
          if (aiProvider === "gemini" && process.env.GEMINI_API_KEY) {
            const { extractLessonContent } = await import("@/lib/gemini/client");
            aiData = await extractLessonContent(rawText);
          } else if (aiProvider === "deepseek" && process.env.DEEPSEEK_API_KEY) {
            const { extractLessonContentDeepseek } = await import("@/lib/deepseek/client");
            aiData = await extractLessonContentDeepseek(rawText);
          } else {
            console.warn(`AI Provider '${aiProvider}' is missing its API Key. Skipping extraction.`);
          }
          
          console.log("AI Extraction completed. Data:", aiData ? "YES" : "NO");
          
          if (aiData) {
            // 1. Process Vocabularies
            if (aiData.vocabularies && Array.isArray(aiData.vocabularies)) {
              for (const vocab of aiData.vocabularies) {
                const { data: vRecord, error: vError } = await supabase.from("vocabularies").insert({
                  user_id: userId,
                  lesson_id: lesson.id,
                  word: vocab.word,
                  meaning: vocab.meaning,
                  ipa: vocab.ipa,
                  part_of_speech: vocab.partOfSpeech,
                  category: vocab.category,
                  difficulty: vocab.difficulty || 'medium'
                }).select("id").single();

                if (!vError && vRecord) {
                  // Insert example sentence
                  await supabase.from("example_sentences").insert({
                    vocabulary_id: vRecord.id,
                    sentence: vocab.exampleSentence,
                    translation: vocab.exampleTranslation,
                    difficulty: vocab.difficulty || 'medium'
                  });

                  // Automatically generate Flashcard
                  await supabase.from("flashcards").insert({
                    vocabulary_id: vRecord.id,
                    user_id: userId,
                    front: vocab.word,
                    back: vocab.meaning,
                    mode: "en_vi"
                  });
                }
              }
            }

            // 2. Process Grammar Topics & Notes
            if (aiData.grammarTopics && Array.isArray(aiData.grammarTopics)) {
              for (const grammar of aiData.grammarTopics) {
                const { data: topicRecord } = await supabase.from("grammar_topics").insert({
                  name: grammar.name,
                  level: grammar.level,
                  description: grammar.description
                }).select("id").single();

                if (topicRecord) {
                  await supabase.from("grammar_notes").insert({
                    user_id: userId,
                    topic_id: topicRecord.id,
                    lesson_id: lesson.id,
                    title: grammar.name,
                    explanation: grammar.explanation,
                    examples: grammar.examples || []
                  });
                }
              }
            }
          }
        }
      } catch (aiError: any) {
        console.error("AI Extraction Pipeline failed:", aiError.message);
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

export async function updateLesson(id: string, formData: FormData) {
  if (!hasSupabaseConfig()) {
    revalidatePath("/lessons");
    return { ok: true };
  }

  const supabase = await createClient();
  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    tags: formData.get("tags"),
    status: formData.get("status") || "draft"
  });

  if (!parsed.success) {
    return { ok: false, message: "Invalid form data" };
  }

  const { error } = await supabase
    .from("lessons")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      tags: parsed.data.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      status: parsed.data.status
    })
    .eq("id", id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/lessons");
  return { ok: true };
}

export async function deleteLesson(id: string) {
  if (!hasSupabaseConfig()) {
    revalidatePath("/lessons");
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/lessons");
  return { ok: true };
}
