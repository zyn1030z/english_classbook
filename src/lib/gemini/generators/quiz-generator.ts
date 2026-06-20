import { getGeminiModel, parseJsonFromModel } from "@/lib/gemini/gemini-client";
import type { Difficulty } from "@/types";

export interface GeneratedQuiz {
 title: string;
 questions: Array<{
 type: "multiple_choice" | "fill_blank" | "correction";
 content: string;
 options?: string[];
 correctAnswer: string;
 explanation: string;
 }>;
}

export async function generateQuiz(topic: string, difficulty: Difficulty): Promise<GeneratedQuiz> {
 const model = getGeminiModel();

 if (!model) {
 return {
 title: `${topic} practice`,
 questions: [
 {
 type: "multiple_choice",
 content: `Which sentence correctly uses ${topic}?`,
 options: ["I have finished it.", "I has finished it.", "I finishing it.", "I finished yet it."],
 correctAnswer: "I have finished it.",
 explanation: "Use have with I for present perfect."
 }
 ]
 };
 }

 const prompt = `Create a ${difficulty} English quiz for Vietnamese learners about ${topic}.
Return valid JSON with title and 5 questions. Include multiple_choice, fill_blank, and correction types.`;
 const result = await model.generateContent(prompt);
 return parseJsonFromModel<GeneratedQuiz>(result.response.text());
}
