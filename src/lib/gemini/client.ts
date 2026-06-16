import { GoogleGenAI, Type, Schema } from "@google/genai";

// Initialize the Google Gen AI SDK
// The SDK automatically picks up the GEMINI_API_KEY environment variable.
const ai = new GoogleGenAI({});

// Define the expected output schema for lesson extraction
const lessonExtractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    vocabularies: {
      type: Type.ARRAY,
      description: "List of at most 10 most important vocabularies extracted from the lesson",
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The vocabulary word in English" },
          meaning: { type: Type.STRING, description: "Meaning of the word in Vietnamese" },
          ipa: { type: Type.STRING, description: "IPA pronunciation (e.g., /ˈæp.əl/)" },
          partOfSpeech: { type: Type.STRING, description: "Part of speech (noun, verb, adjective, etc.)" },
          category: { type: Type.STRING, description: "General topic or category of the word" },
          difficulty: { type: Type.STRING, description: "Difficulty level: 'easy', 'medium', or 'hard'" },
          exampleSentence: { type: Type.STRING, description: "An example sentence using the word in English" },
          exampleTranslation: { type: Type.STRING, description: "Vietnamese translation of the example sentence" }
        },
        required: ["word", "meaning", "ipa", "partOfSpeech", "category", "difficulty", "exampleSentence", "exampleTranslation"]
      }
    },
    grammarTopics: {
      type: Type.ARRAY,
      description: "List of 1 to 3 key grammar topics used in the lesson",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the grammar topic (e.g., Present Perfect, Conditionals)" },
          level: { type: Type.STRING, description: "CEFR level: 'A1', 'A2', 'B1', or 'B2'" },
          description: { type: Type.STRING, description: "Brief description in Vietnamese" },
          explanation: { type: Type.STRING, description: "Detailed explanation in Vietnamese of how it is used in the text" },
          examples: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 2 example sentences demonstrating the grammar topic"
          }
        },
        required: ["name", "level", "description", "explanation", "examples"]
      }
    }
  },
  required: ["vocabularies", "grammarTopics"]
};

export async function extractLessonContent(text: string, limit: number = 10) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  // Clone schema and dynamically set vocabulary limit description
  const customSchema = {
    ...lessonExtractionSchema,
    properties: {
      ...lessonExtractionSchema.properties,
      vocabularies: {
        ...(lessonExtractionSchema.properties as any).vocabularies,
        description: `List of at most ${limit} most important vocabularies extracted from the lesson`
      }
    }
  };

  const prompt = `
Bạn là một giáo viên tiếng Anh xuất sắc. Dưới đây là nội dung văn bản của một bài học tiếng Anh.
Nhiệm vụ của bạn là phân tích văn bản này và trích xuất ra các từ vựng quan trọng nhất (tối đa ${limit} từ) và các điểm ngữ pháp đáng chú ý (tối đa 3 điểm).
Hãy trả về dữ liệu tuân thủ chính xác định dạng JSON schema đã được cấu hình.
Đối với mỗi từ vựng, hãy đặt một câu ví dụ tiếng Anh (lấy từ văn bản hoặc tự tạo) và dịch sang tiếng Việt.
Đối với ngữ pháp, hãy giải thích ngắn gọn cách dùng và đưa ra ví dụ.

Nội dung bài học:
"""
${text}
"""
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: customSchema,
        temperature: 0.2, // Low temperature for more deterministic JSON output
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini AI Extraction Error:", error);
    throw error;
  }
}

// Define the expected output schema for quiz generation
const quizGenerationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: "List of exactly 10 multiple choice questions",
      items: {
        type: Type.OBJECT,
        properties: {
          questionType: { type: Type.STRING, description: "Type of question: 'vocabulary' or 'grammar'" },
          content: { type: Type.STRING, description: "The question text (e.g., Fill in the blank or Choose the correct grammar)" },
          options: {
            type: Type.ARRAY,
            description: "Exactly 4 possible string answers",
            items: { type: Type.STRING }
          },
          correctAnswer: { type: Type.STRING, description: "The exact string of the correct option from the options array" },
          explanation: { type: Type.STRING, description: "Brief explanation in Vietnamese of why this answer is correct" }
        },
        required: ["questionType", "content", "options", "correctAnswer", "explanation"]
      }
    }
  },
  required: ["questions"]
};

/**
 * Sends vocabulary and grammar data to Gemini AI to generate a 10-question multiple-choice quiz.
 */
export async function generateQuizContentGemini(vocabularies: any[], grammarTopics: any[]) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const prompt = `
Bạn là một giáo viên tiếng Anh chuyên nghiệp chuyên ra đề thi. Dưới đây là danh sách từ vựng và chủ đề ngữ pháp mà học sinh vừa học:

Từ vựng:
${JSON.stringify(vocabularies, null, 2)}

Ngữ pháp:
${JSON.stringify(grammarTopics, null, 2)}

Nhiệm vụ của bạn: Hãy tạo ra một bài kiểm tra trắc nghiệm (Multiple choice quiz) gồm đúng 10 câu hỏi để kiểm tra kiến thức của học sinh dựa trên danh sách trên.
- 5 câu hỏi về Từ vựng (điền từ vào chỗ trống, chọn từ đồng nghĩa, v.v.)
- 5 câu hỏi về Ngữ pháp (chọn dạng đúng của động từ, sửa lỗi sai, v.v.)
Mỗi câu hỏi phải có ĐÚNG 4 lựa chọn (options) và 1 đáp án đúng (correctAnswer). Phải có giải thích bằng tiếng Việt (explanation).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizGenerationSchema,
        temperature: 0.3,
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini AI Quiz Generation Error:", error);
    throw error;
  }
}
