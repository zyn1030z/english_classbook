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

  const vocabLimit = Number(formData.get("vocabLimit")) || 10;

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
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${userId}/${lesson.id}/${Date.now()}_${safeName}`;

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
            file_url: storageData.path,
            file_type: file.type,
            processing_status: 'completed'
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
          console.log(`Starting AI extraction with provider: ${aiProvider}, limit: ${vocabLimit}`);
          let aiData = null;
          
          if (aiProvider === "gemini" && process.env.GEMINI_API_KEY) {
            const { extractLessonContent } = await import("@/lib/gemini/client");
            aiData = await extractLessonContent(rawText, vocabLimit);
          } else if (aiProvider === "deepseek" && process.env.DEEPSEEK_API_KEY) {
            const { extractLessonContentDeepseek } = await import("@/lib/deepseek/client");
            aiData = await extractLessonContentDeepseek(rawText, vocabLimit);
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

            // 2. Process Grammar Topics & Notes (upsert to avoid duplicates)
            if (aiData.grammarTopics && Array.isArray(aiData.grammarTopics)) {
              for (const grammar of aiData.grammarTopics) {
                // Find existing topic by name+level to avoid duplicates
                const { data: existingTopic } = await supabase
                  .from("grammar_topics")
                  .select("id")
                  .eq("name", grammar.name)
                  .eq("level", grammar.level)
                  .maybeSingle();

                const topicId = existingTopic?.id || (await supabase.from("grammar_topics").insert({
                  name: grammar.name,
                  level: grammar.level,
                  description: grammar.description
                }).select("id").single()).data?.id;

                if (topicId) {
                  await supabase.from("grammar_notes").insert({
                    user_id: userId,
                    topic_id: topicId,
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
  revalidatePath("/grammar");
  revalidatePath("/flashcards");
  revalidatePath("/vocabulary");
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

export async function generateLessonQuiz(lessonId: string) {
  if (!hasSupabaseConfig()) return { ok: false, message: "Database not configured" };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false, message: "Unauthorized" };

  // 1. Fetch source material (Vocab & Grammar)
  const { data: vocabularies } = await supabase
    .from("vocabularies")
    .select("word, meaning, part_of_speech, category")
    .eq("lesson_id", lessonId)
    .limit(10);

  const { data: grammarNotes } = await supabase
    .from("grammar_notes")
    .select("title, explanation")
    .eq("lesson_id", lessonId)
    .limit(3);

  if (!vocabularies?.length && !grammarNotes?.length) {
    return { ok: false, message: "Bài học chưa có dữ liệu từ vựng/ngữ pháp để tạo đề thi." };
  }

  // 2. Generate Quiz using AI
  const aiProvider = process.env.AI_PROVIDER || "gemini";
  let quizData = null;

  try {
    if (aiProvider === "gemini" && process.env.GEMINI_API_KEY) {
      const { generateQuizContentGemini } = await import("@/lib/gemini/client");
      quizData = await generateQuizContentGemini(vocabularies || [], grammarNotes || []);
    } else if (aiProvider === "deepseek" && process.env.DEEPSEEK_API_KEY) {
      const { generateQuizContentDeepseek } = await import("@/lib/deepseek/client");
      quizData = await generateQuizContentDeepseek(vocabularies || [], grammarNotes || []);
    } else {
      return { ok: false, message: `Missing API Key for ${aiProvider}` };
    }
  } catch (error: any) {
    console.error("AI Quiz Generation Error:", error.message);
    return { ok: false, message: "AI API error: " + error.message };
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return { ok: false, message: "AI failed to generate quiz questions." };
  }

  // 3. Clear existing quiz for this lesson
  await supabase.from("quizzes").delete().eq("lesson_id", lessonId).eq("quiz_type", "lesson_review");

  // 4. Save to Database
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      user_id: userId,
      lesson_id: lessonId,
      quiz_type: "lesson_review",
      difficulty: "medium"
    })
    .select("id")
    .single();

  if (quizError || !quiz) {
    console.error("Insert Quiz Error:", quizError);
    return { ok: false, message: "Database error while saving quiz." };
  }

  // Bulk process questions and answers
  for (const q of quizData.questions) {
    const { data: question, error: qError } = await supabase
      .from("quiz_questions")
      .insert({
        quiz_id: quiz.id,
        question_type: q.questionType,
        content: q.content,
        correct_answer: q.correctAnswer,
        explanation: q.explanation
      })
      .select("id")
      .single();

    if (question && !qError) {
      const answers = q.options.map((opt: string) => ({
        question_id: question.id,
        answer: opt,
        is_correct: opt === q.correctAnswer
      }));
      await supabase.from("quiz_answers").insert(answers);
    }
  }

  revalidatePath("/lessons");
  revalidatePath(`/lessons/${lessonId}/quiz`);
  return { ok: true, quizId: quiz.id };
}

export async function getLessonFile(lessonId: string) {
  if (!hasSupabaseConfig()) return null;

  // Verify ownership through lessons table (RLS-protected)
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id")
    .eq("id", lessonId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!lesson) return null;

  // Use admin client to read lesson_files (no user_id column → RLS blocks regular client)
  const { createClient: createAdminClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin
    .from("lesson_files")
    .select("id, file_url, file_type")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) {
    console.error("Lỗi getLessonFile:", error);
  }

  if (error || !data) return null;

  const fileNameParts = data.file_url.split("/");
  const lastPart = fileNameParts[fileNameParts.length - 1];
  const fileName = lastPart.includes("_") ? lastPart.substring(lastPart.indexOf("_") + 1) : lastPart;

  return { 
    id: data.id, 
    file_name: fileName, 
    file_path: data.file_url, 
    mime_type: data.file_type 
  };
}

export async function reExtractVocabulary(lessonId: string, limit: number = 10) {
  if (!hasSupabaseConfig()) return { ok: false, message: "Database not configured" };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false, message: "Unauthorized" };

  // 1. Get file record (admin client needed - lesson_files has no user_id for RLS)
    const { createClient: createAdminClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: fileRecord, error: fileError } = await supabaseAdmin
    .from("lesson_files")
    .select("*")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (fileError || !fileRecord) {
    return { ok: false, message: "Bài học không có file đính kèm để trích xuất lại." };
  }

  try {
    // 2. Download file from Storage

    const { data: blob, error: downloadError } = await supabaseAdmin.storage
      .from("lesson-files")
      .download(fileRecord.file_path);

    if (downloadError || !blob) {
      return { ok: false, message: "Không thể tải tệp tin từ máy chủ: " + (downloadError?.message || "Unknown error") };
    }

    // 3. Extract text from file Blob
    const { extractTextFromFile } = await import("@/lib/utils/file-parser");
    const file = new File([blob], fileRecord.file_name, { type: fileRecord.mime_type });
    const rawText = await extractTextFromFile(file);

    if (!rawText || rawText.length <= 50) {
      return { ok: false, message: "Văn bản trích xuất từ file quá ngắn hoặc trống." };
    }

    // 4. Extract lesson content via AI
    const aiProvider = process.env.AI_PROVIDER || "gemini";
    let aiData = null;

    if (aiProvider === "gemini" && process.env.GEMINI_API_KEY) {
      const { extractLessonContent } = await import("@/lib/gemini/client");
      aiData = await extractLessonContent(rawText, limit);
    } else if (aiProvider === "deepseek" && process.env.DEEPSEEK_API_KEY) {
      const { extractLessonContentDeepseek } = await import("@/lib/deepseek/client");
      aiData = await extractLessonContentDeepseek(rawText, limit);
    } else {
      return { ok: false, message: `Chưa cấu hình API Key cho AI Provider: ${aiProvider}` };
    }

    if (!aiData) {
      return { ok: false, message: "AI trích xuất dữ liệu thất bại." };
    }

    // 5. Clean up old vocabulary, example sentences, and flashcards associated with this lesson
    const { data: oldVocabs } = await supabase
      .from("vocabularies")
      .select("id")
      .eq("lesson_id", lessonId);

    const vocabIds = oldVocabs?.map((v) => v.id) || [];

    if (vocabIds.length > 0) {
      await supabase.from("example_sentences").delete().in("vocabulary_id", vocabIds);
      await supabase.from("flashcards").delete().in("vocabulary_id", vocabIds);
      await supabase.from("vocabularies").delete().eq("lesson_id", lessonId);
    }

    await supabase.from("grammar_notes").delete().eq("lesson_id", lessonId);

    // 6. Insert new Vocabularies & Flashcards & Grammar
    if (aiData.vocabularies && Array.isArray(aiData.vocabularies)) {
      for (const vocab of aiData.vocabularies) {
        const { data: vRecord, error: vError } = await supabase
          .from("vocabularies")
          .insert({
            user_id: userId,
            lesson_id: lessonId,
            word: vocab.word,
            meaning: vocab.meaning,
            ipa: vocab.ipa,
            part_of_speech: vocab.partOfSpeech,
            category: vocab.category,
            difficulty: vocab.difficulty || 'medium'
          })
          .select("id")
          .single();

        if (!vError && vRecord) {
          await supabase.from("example_sentences").insert({
            vocabulary_id: vRecord.id,
            sentence: vocab.exampleSentence,
            translation: vocab.exampleTranslation,
            difficulty: vocab.difficulty || 'medium'
          });

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

    if (aiData.grammarTopics && Array.isArray(aiData.grammarTopics)) {
      for (const grammar of aiData.grammarTopics) {
        const { data: existingTopic } = await supabase
          .from("grammar_topics")
          .select("id")
          .eq("name", grammar.name)
          .eq("level", grammar.level)
          .maybeSingle();

        const topicId = existingTopic?.id || (await supabase.from("grammar_topics").insert({
          name: grammar.name,
          level: grammar.level,
          description: grammar.description
        }).select("id").single()).data?.id;

        if (topicId) {
          await supabase.from("grammar_notes").insert({
            user_id: userId,
            topic_id: topicId,
            lesson_id: lessonId,
            title: grammar.name,
            explanation: grammar.explanation,
            examples: grammar.examples || []
          });
        }
      }
    }

    revalidatePath("/lessons");
    revalidatePath("/vocabulary");
    revalidatePath("/grammar");
    revalidatePath("/flashcards");
    return { ok: true };
  } catch (err: any) {
    console.error("Re-extraction pipeline failed:", err.message);
    return { ok: false, message: "Lỗi trong quá trình xử lý: " + err.message };
  }
}

export async function uploadLessonFileAndExtract(lessonId: string, formData: FormData) {
  if (!hasSupabaseConfig()) return { ok: false, message: "Database not configured" };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false, message: "Unauthorized" };

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id")
    .eq("id", lessonId)
    .eq("user_id", userId)
    .single();

  if (lessonError || !lesson) return { ok: false, message: "Bài học không tồn tại." };

  const vocabLimit = Number(formData.get("vocabLimit")) || 10;
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { ok: false, message: "Vui lòng chọn một tệp hợp lệ." };
  }

  try {
    const fileExt = file.name.split(".").pop();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${userId}/${lessonId}/${Date.now()}_${safeName}`;

    const { createClient: createAdminClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === "lesson-files");
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket("lesson-files", { public: false, fileSizeLimit: 10485760 });
    }

    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from("lesson-files")
      .upload(filePath, file, { contentType: file.type, upsert: true });

    if (storageError || !storageData) {
      return { ok: false, message: "Upload storage failed: " + storageError?.message };
    }

    await supabaseAdmin.from("lesson_files").delete().eq("lesson_id", lessonId);

    const { error: insertError } = await supabaseAdmin.from("lesson_files").insert({
      lesson_id: lessonId,
      file_url: storageData.path,
      file_type: file.type,
      processing_status: 'completed'
    });

    if (insertError) {
      console.error("Lỗi insert lesson_files:", insertError);
      return { ok: false, message: "Không thể lưu metadata của file: " + insertError.message };
    }

    const { extractTextFromFile } = await import("@/lib/utils/file-parser");
    const rawText = await extractTextFromFile(file);

    if (!rawText || rawText.length <= 50) {
      return { ok: false, message: "Văn bản trích xuất từ file quá ngắn hoặc trống." };
    }

    const aiProvider = process.env.AI_PROVIDER || "gemini";
    let aiData = null;

    if (aiProvider === "gemini" && process.env.GEMINI_API_KEY) {
      const { extractLessonContent } = await import("@/lib/gemini/client");
      aiData = await extractLessonContent(rawText, vocabLimit);
    } else if (aiProvider === "deepseek" && process.env.DEEPSEEK_API_KEY) {
      const { extractLessonContentDeepseek } = await import("@/lib/deepseek/client");
      aiData = await extractLessonContentDeepseek(rawText, vocabLimit);
    } else {
      return { ok: false, message: `Chưa cấu hình API Key cho AI Provider: ${aiProvider}` };
    }

    if (!aiData) return { ok: false, message: "AI trích xuất dữ liệu thất bại." };

    const { data: oldVocabs } = await supabase.from("vocabularies").select("id").eq("lesson_id", lessonId);
    const vocabIds = oldVocabs?.map((v) => v.id) || [];
    if (vocabIds.length > 0) {
      await supabase.from("example_sentences").delete().in("vocabulary_id", vocabIds);
      await supabase.from("flashcards").delete().in("vocabulary_id", vocabIds);
      await supabase.from("vocabularies").delete().eq("lesson_id", lessonId);
    }
    await supabase.from("grammar_notes").delete().eq("lesson_id", lessonId);

    if (aiData.vocabularies && Array.isArray(aiData.vocabularies)) {
      for (const vocab of aiData.vocabularies) {
        const { data: vRecord, error: vError } = await supabase.from("vocabularies").insert({
          user_id: userId,
          lesson_id: lessonId,
          word: vocab.word,
          meaning: vocab.meaning,
          ipa: vocab.ipa,
          part_of_speech: vocab.partOfSpeech,
          category: vocab.category,
          difficulty: vocab.difficulty || 'medium'
        }).select("id").single();

        if (!vError && vRecord) {
          await supabase.from("example_sentences").insert({
            vocabulary_id: vRecord.id, sentence: vocab.exampleSentence, translation: vocab.exampleTranslation, difficulty: vocab.difficulty || 'medium'
          });
          await supabase.from("flashcards").insert({
            vocabulary_id: vRecord.id, user_id: userId, front: vocab.word, back: vocab.meaning, mode: "en_vi"
          });
        }
      }
    }

    if (aiData.grammarTopics && Array.isArray(aiData.grammarTopics)) {
      for (const grammar of aiData.grammarTopics) {
        const { data: existingTopic } = await supabase
          .from("grammar_topics")
          .select("id")
          .eq("name", grammar.name)
          .eq("level", grammar.level)
          .maybeSingle();

        const topicId = existingTopic?.id || (await supabase.from("grammar_topics").insert({
          name: grammar.name, level: grammar.level, description: grammar.description
        }).select("id").single()).data?.id;

        if (topicId) {
          await supabase.from("grammar_notes").insert({
            user_id: userId, topic_id: topicId, lesson_id: lessonId, title: grammar.name, explanation: grammar.explanation, examples: grammar.examples || []
          });
        }
      }
    }

    revalidatePath("/lessons");
    revalidatePath("/vocabulary");
    revalidatePath("/grammar");
    revalidatePath("/flashcards");
    return { ok: true, file: { id: Date.now().toString(), file_name: file.name } };

  } catch (err: any) {
    console.error("Upload & Extraction pipeline failed:", err.message);
    return { ok: false, message: "Lỗi trong quá trình xử lý: " + err.message };
  }
}
