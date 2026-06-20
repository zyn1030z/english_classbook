import OpenAI from "openai";

const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY || "",
});

/** Attempt to parse JSON, with fallback repair for truncated responses */
function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const lastBrace = text.lastIndexOf("}");
    const lastBracket = text.lastIndexOf("]");
    const cutoff = Math.max(lastBrace, lastBracket);
    if (cutoff > 0) {
      for (let i = cutoff; i >= Math.max(0, cutoff - 200); i--) {
        const candidate = text.substring(0, i + 1);
        try {
          const openBraces = (candidate.match(/{/g) || []).length - (candidate.match(/}/g) || []).length;
          const openBrackets = (candidate.match(/\[/g) || []).length - (candidate.match(/]/g) || []).length;
          const suffix = "]".repeat(Math.max(0, openBrackets)) + "}".repeat(Math.max(0, openBraces));
          return JSON.parse(candidate + suffix);
        } catch { continue; }
      }
    }
    throw new Error(`AI trả về JSON không hợp lệ (${text.length} ký tự). Thử giảm số lượng từ vựng hoặc dùng file ngắn hơn.`);
  }
}

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

export async function extractLessonContentDeepseek(text: string, limit: number = 10, grammarLimit: number = 3) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is missing");
  }

  // Clone schema and dynamically set limit descriptions
  const customJsonSchema = {
    ...jsonSchema,
    schema: {
      ...jsonSchema.schema,
      properties: {
        ...jsonSchema.schema.properties,
        vocabularies: {
          ...jsonSchema.schema.properties.vocabularies,
          description: `List of at most ${limit} most important vocabularies extracted from the lesson`
        },
        grammarTopics: {
          ...jsonSchema.schema.properties.grammarTopics,
          description: `List of ${grammarLimit} key grammar topics used in the lesson`
        }
      }
    }
  };

  const prompt = `
Bạn là một giáo viên tiếng Anh xuất sắc. Dưới đây là nội dung văn bản của một bài học tiếng Anh.
Nhiệm vụ của bạn là phân tích văn bản này và trích xuất ra các từ vựng quan trọng nhất (tối đa ${limit} từ) và các điểm ngữ pháp đáng chú ý (tối đa ${grammarLimit} điểm).
Đối với mỗi từ vựng, hãy đặt một câu ví dụ tiếng Anh (lấy từ văn bản hoặc tự tạo) và dịch sang tiếng Việt.
Đối với ngữ pháp, hãy giải thích ngắn gọn cách dùng và đưa ra ví dụ.

BẠN BẮT BUỘC PHẢI TRẢ VỀ MỘT ĐỐI TƯỢNG JSON TUÂN THỦ ĐÚNG SCHEMA SAU ĐÂY:
${JSON.stringify(customJsonSchema.schema, null, 2)}

Nội dung bài học:
"""
${text}
"""
  `;

  try {
    console.log(`[DeepSeek] Calling model=deepseek-v4-flash | task=extraction | vocabLimit=${limit} | grammarLimit=${grammarLimit} | textLen=${text.length} | max_tokens=32768`);
    const response = await deepseek.chat.completions.create({
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: "You are a helpful assistant designed to output structured JSON exactly matching the requested schema." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 32768,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return safeJsonParse(content);
    }
    return null;
  } catch (error) {
    console.error("DeepSeek AI Extraction Error:", error);
    throw error;
  }
}

const quizJsonSchema = {
  name: "quiz_generation",
  schema: {
    type: "object",
    properties: {
      questions: {
        type: "array",
        description: "List of exactly 30 multiple choice questions (20 vocabulary, 10 grammar)",
        items: {
          type: "object",
          properties: {
            questionType: { type: "string", description: "Type of question: 'vocabulary' or 'grammar'" },
            content: { type: "string", description: "The question text (e.g., Fill in the blank or Choose the correct grammar)" },
            options: {
              type: "array",
              description: "Exactly 4 possible string answers",
              items: { type: "string" }
            },
            correctAnswer: { type: "string", description: "The exact string of the correct option from the options array" },
            explanation: { type: "string", description: "Brief explanation in Vietnamese of why this answer is correct" }
          },
          required: ["questionType", "content", "options", "correctAnswer", "explanation"],
          additionalProperties: false
        }
      }
    },
    required: ["questions"],
    additionalProperties: false
  },
  strict: true
};

/**
 * Sends vocabulary and grammar data to DeepSeek AI to generate a 10-question multiple-choice quiz.
 */
export async function generateQuizContentDeepseek(vocabularies: any[], grammarTopics: any[]) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is missing");
  }

  const prompt = `
Bạn là một giáo viên tiếng Anh chuyên nghiệp chuyên ra đề thi. Dưới đây là danh sách từ vựng và chủ đề ngữ pháp mà học sinh vừa học:

Từ vựng:
${JSON.stringify(vocabularies, null, 2)}

Ngữ pháp:
${JSON.stringify(grammarTopics, null, 2)}

Nhiệm vụ của bạn: Hãy tạo ra một bài kiểm tra trắc nghiệm (Multiple choice quiz) gồm đúng 30 câu hỏi để kiểm tra kiến thức của học sinh dựa trên danh sách trên.
- 20 câu hỏi về Từ vựng (chọn nghĩa đúng, điền từ vào chỗ trống, chọn từ đồng nghĩa/trái nghĩa, v.v.)
- 10 câu hỏi về Ngữ pháp (chọn dạng đúng của động từ, sửa lỗi sai, điền từ, v.v.)
Mỗi câu hỏi phải có ĐÚNG 4 lựa chọn (options) và 1 đáp án đúng (correctAnswer). Phải có giải thích bằng tiếng Việt (explanation).

BẠN BẮT BUỘC PHẢI TRẢ VỀ MỘT ĐỐI TƯỢNG JSON TUÂN THỦ ĐÚNG SCHEMA SAU ĐÂY:
${JSON.stringify(quizJsonSchema.schema, null, 2)}
  `;

  try {
    console.log(`[DeepSeek] Calling model=deepseek-v4-flash | task=quiz | vocabs=${vocabularies.length} | grammar=${grammarTopics.length} | max_tokens=32768`);
    const response = await deepseek.chat.completions.create({
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: "You are a helpful assistant designed to output structured JSON exactly matching the requested schema." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 32768,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return safeJsonParse(content);
    }
    return null;
  } catch (error) {
    console.error("DeepSeek AI Quiz Generation Error:", error);
    throw error;
  }
}
