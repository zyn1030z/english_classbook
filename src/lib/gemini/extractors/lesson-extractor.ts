import { getGeminiModel, parseJsonFromModel } from "@/lib/gemini/gemini-client";
import type { Difficulty } from "@/types";

export interface ExtractedVocabulary {
  word: string;
  meaning: string;
  ipa?: string;
  partOfSpeech: string;
  category: string;
  difficulty: Difficulty;
  example: string;
  translation: string;
}

export interface ExtractedLessonContent {
  title: string;
  summary: string;
  vocabulary: ExtractedVocabulary[];
  grammar: Array<{ topic: string; explanation: string; examples: string[] }>;
  exercises: Array<{ type: string; prompt: string; answer: string }>;
}

export async function extractLessonContent(text: string): Promise<ExtractedLessonContent> {
  const model = getGeminiModel();

  if (!model) {
    return fallbackExtraction(text);
  }

  const prompt = `You are an English teacher for Vietnamese learners. Extract structured JSON from this lesson text.
Return only valid JSON with keys: title, summary, vocabulary, grammar, exercises.
Vocabulary items need: word, meaning in Vietnamese without accents, ipa, partOfSpeech, category, difficulty, example, translation.

Lesson text:
${text.slice(0, 12000)}`;

  const result = await model.generateContent(prompt);
  return parseJsonFromModel<ExtractedLessonContent>(result.response.text());
}

function fallbackExtraction(text: string): ExtractedLessonContent {
  const words = Array.from(new Set(text.match(/\b[a-zA-Z]{5,}\b/g) ?? [])).slice(0, 8);

  return {
    title: text.split("\n").find(Boolean)?.slice(0, 80) || "Imported lesson",
    summary: text.slice(0, 220),
    vocabulary: words.map((word) => ({
      word,
      meaning: "can bo sung nghia",
      partOfSpeech: "unknown",
      category: "imported",
      difficulty: "medium",
      example: `I noticed the word ${word} in this lesson.`,
      translation: `Toi thay tu ${word} trong bai hoc nay.`
    })),
    grammar: [],
    exercises: []
  };
}
