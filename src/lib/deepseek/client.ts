import OpenAI from "openai";

const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY || "",
});

const jsonSchema = {
  name: "lesson_extraction",
  schema: {
    type: "object",
    properties: {
      vocabularies: {
        type: "array",
        description: "List of at most 10 most important vocabularies extracted from the lesson",
        items: {
          type: "object",
          properties: {
            word: { type: "string", description: "The vocabulary word in English" },
            meaning: { type: "string", description: "Meaning of the word in Vietnamese" },
            ipa: { type: "string", description: "IPA pronunciation (e.g., /ˈæp.əl/)" },
            partOfSpeech: { type: "string", description: "Part of speech (noun, verb, adjective, etc.)" },
            category: { type: "string", description: "General topic or category of the word" },
            difficulty: { type: "string", description: "Difficulty level: 'easy', 'medium', or 'hard'" },
            exampleSentence: { type: "string", description: "An example sentence using the word in English" },
            exampleTranslation: { type: "string", description: "Vietnamese translation of the example sentence" }
          },
          required: ["word", "meaning", "ipa", "partOfSpeech", "category", "difficulty", "exampleSentence", "exampleTranslation"],
          additionalProperties: false
        }
      },
      grammarTopics: {
        type: "array",
        description: "List of 1 to 3 key grammar topics used in the lesson",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name of the grammar topic (e.g., Present Perfect, Conditionals)" },
            level: { type: "string", description: "CEFR level: 'A1', 'A2', 'B1', or 'B2'" },
            description: { type: "string", description: "Brief description in Vietnamese" },
            explanation: { type: "string", description: "Detailed explanation in Vietnamese of how it is used in the text" },
            examples: {
              type: "array",
              items: { type: "string" },
              description: "List of 2 example sentences demonstrating the grammar topic"
            }
          },
          required: ["name", "level", "description", "explanation", "examples"],
          additionalProperties: false
        }
      }
    },
    required: ["vocabularies", "grammarTopics"],
    additionalProperties: false
  },
  strict: true
};

/**
 * Sends text to DeepSeek AI to extract vocabulary and grammar points.
 */
export async function extractLessonContentDeepseek(text: string) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is missing");
  }

  const prompt = `
Bạn là một giáo viên tiếng Anh xuất sắc. Dưới đây là nội dung văn bản của một bài học tiếng Anh.
Nhiệm vụ của bạn là phân tích văn bản này và trích xuất ra các từ vựng quan trọng nhất (tối đa 10 từ) và các điểm ngữ pháp đáng chú ý (tối đa 3 điểm).
Đối với mỗi từ vựng, hãy đặt một câu ví dụ tiếng Anh (lấy từ văn bản hoặc tự tạo) và dịch sang tiếng Việt.
Đối với ngữ pháp, hãy giải thích ngắn gọn cách dùng và đưa ra ví dụ.

BẠN BẮT BUỘC PHẢI TRẢ VỀ MỘT ĐỐI TƯỢNG JSON TUÂN THỦ ĐÚNG SCHEMA SAU ĐÂY:
${JSON.stringify(jsonSchema.schema, null, 2)}

Nội dung bài học:
"""
${text}
"""
  `;

  try {
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a helpful assistant designed to output structured JSON exactly matching the requested schema." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    console.error("DeepSeek AI Extraction Error:", error);
    throw error;
  }
}
