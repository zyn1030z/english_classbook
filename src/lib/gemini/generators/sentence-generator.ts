import { getGeminiModel, parseJsonFromModel } from "@/lib/gemini/gemini-client";

export interface GeneratedSentences {
  easy: { sentence: string; translation: string };
  medium: { sentence: string; translation: string };
  hard: { sentence: string; translation: string; grammarExplanation: string };
}

export async function generateSentences(word: string, meaning: string): Promise<GeneratedSentences> {
  const model = getGeminiModel();

  if (!model) {
    return {
      easy: { sentence: `I use ${word} every day.`, translation: `Toi dung ${word} moi ngay.` },
      medium: { sentence: `The team discussed ${word} during the meeting.`, translation: `Nhom da thao luan ve ${meaning} trong cuoc hop.` },
      hard: {
        sentence: `Although ${word} seemed simple at first, it changed the whole conversation.`,
        translation: `Mac du ${meaning} ban dau co ve don gian, no da thay doi ca cuoc tro chuyen.`,
        grammarExplanation: "Although introduces contrast between expectation and result."
      }
    };
  }

  const prompt = `Generate JSON examples for Vietnamese English learners using "${word}" meaning "${meaning}".
Return keys easy, medium, hard. Each has sentence and translation. Hard also has grammarExplanation.`;
  const result = await model.generateContent(prompt);
  return parseJsonFromModel<GeneratedSentences>(result.response.text());
}
