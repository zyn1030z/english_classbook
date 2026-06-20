"use server";

export interface GrammarCorrection {
  original: string;
  replacement: string;
  explanation: string;
}

export interface WritingAnalytics {
  score: string;
  tone: string;
  cefr_level: string;
  advanced_words: string[];
}

export interface WritingFeedback {
  corrections: GrammarCorrection[];
  native_version: string;
  analytics: WritingAnalytics;
}

export interface WritingPrompt {
  id: string;
  title: string;
  description: string;
}

const WRITING_PROMPTS: WritingPrompt[] = [
  { id: "freestyle", title: "Freestyle / General", description: "Write whatever is on your mind. Great for daily journaling." },
  { id: "ielts_task1", title: "IELTS Task 1 (Academic)", description: "Describe a graph, chart, map, or process diagram." },
  { id: "ielts_task2", title: "IELTS Task 2 (Essay)", description: "Write an argumentative or opinion essay on a specific topic." },
  { id: "business_email", title: "Business Email", description: "Write a professional email (e.g., apologizing to a client, requesting information)." },
];

export async function getWritingPrompts(): Promise<{ prompts: WritingPrompt[] }> {
  return { prompts: WRITING_PROMPTS };
}

export async function checkGrammarWithAI(text: string, promptTitle: string = "Freestyle"): Promise<{ ok: boolean; data?: WritingFeedback; message?: string }> {
  try {
    const aiProvider = process.env.AI_PROVIDER || "gemini";

    const systemPrompt = `
You are an expert English teacher and IELTS examiner. The user will provide an English text.
The context or topic of this text is: "${promptTitle}".
Analyze the text for grammar, spelling, unnatural phrasing, and overall quality.

You MUST respond with a JSON object exactly matching this structure:
{
  "corrections": [
    {
      "original": "<the exact incorrect word or short phrase from the user's text>",
      "replacement": "<the corrected version>",
      "explanation": "<brief explanation in Vietnamese of why it was wrong and the grammar rule>"
    }
  ],
  "native_version": "<a completely rewritten, natural, native-sounding version of the user's text>",
  "analytics": {
    "score": "<Band score (1-9) if IELTS, or 1-10 if General/Business>",
    "tone": "<e.g., Formal, Casual, Aggressive, Professional>",
    "cefr_level": "<e.g., A2, B1, B2, C1, C2 based on vocabulary used>",
    "advanced_words": ["<list of C1/C2 vocabulary used correctly by the user>"]
  }
}

Rules:
1. "original" must match the user's text exactly (case-sensitive) so I can highlight it in the UI.
2. Do not include markdown formatting (like \`\`\`json) in your response, just the raw JSON string.
3. If the text is perfect, return an empty array for corrections.
`;

    if (aiProvider === "deepseek" && process.env.DEEPSEEK_API_KEY) {
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({
        baseURL: "https://api.deepseek.com",
        apiKey: process.env.DEEPSEEK_API_KEY,
      });

      const response = await client.chat.completions.create({
        model: "deepseek-v4-flash",
        max_tokens: 1024,
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
      });

      const content = response.choices[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI format");
      
      const parsed = JSON.parse(jsonMatch[0]);
      return { ok: true, data: parsed as WritingFeedback };

    } else if (aiProvider === "gemini" && process.env.GEMINI_API_KEY) {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
${systemPrompt}

User's Text:
${text}

Generate JSON response:`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const content = response.text || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI format");
      
      const parsed = JSON.parse(jsonMatch[0]);
      return { ok: true, data: parsed as WritingFeedback };
    } else {
      return { ok: false, message: `Missing API Key for ${aiProvider}` };
    }
  } catch (error: any) {
    console.error("[WritingLab] Check error:", error);
    return { ok: false, message: error.message || "Failed to check grammar" };
  }
}
