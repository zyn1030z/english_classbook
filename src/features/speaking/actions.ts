"use server";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export interface SpeakingFeedback {
  overallScore: number; // 1-10
  pronunciation: number;
  grammar: number;
  fluency: number;
  vocabulary: number;
  strengths: string[];
  improvements: string[];
  correctedVersion: string;
  tip: string;
}

export async function evaluateSpeaking(
  question: string,
  transcript: string
): Promise<{ ok: boolean; feedback?: SpeakingFeedback; message?: string }> {
  try {
    const aiProvider = process.env.AI_PROVIDER || "gemini";

    let feedback: SpeakingFeedback;

    if (aiProvider === "deepseek" && process.env.DEEPSEEK_API_KEY) {
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({
        baseURL: "https://api.deepseek.com",
        apiKey: process.env.DEEPSEEK_API_KEY,
      });

      const response = await client.chat.completions.create({
        model: "deepseek-v4-flash",
        max_tokens: 2048,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `You are an expert English speaking coach. Evaluate the student's spoken response to the given question.

Return a JSON object with exactly this structure:
{
  "overallScore": <number 1-10>,
  "pronunciation": <number 1-10>,
  "grammar": <number 1-10>,
  "fluency": <number 1-10>,
  "vocabulary": <number 1-10>,
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<area1>", "<area2>"],
  "correctedVersion": "<the student's response rewritten with correct grammar and natural phrasing>",
  "tip": "<one specific, actionable tip to improve>"
}

Be encouraging but honest. Focus on practical improvements.`,
          },
          {
            role: "user",
            content: `Question: "${question}"\n\nStudent's response: "${transcript}"`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { ok: false, message: "AI returned invalid format" };
      }
      feedback = JSON.parse(jsonMatch[0]);
    } else if (aiProvider === "gemini" && process.env.GEMINI_API_KEY) {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `You are an expert English speaking coach. Evaluate the student's spoken response.

Question: "${question}"
Student's response: "${transcript}"

Return ONLY a JSON object:
{
  "overallScore": <number 1-10>,
  "pronunciation": <number 1-10>,
  "grammar": <number 1-10>,
  "fluency": <number 1-10>,
  "vocabulary": <number 1-10>,
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<area1>", "<area2>"],
  "correctedVersion": "<rewritten with correct grammar>",
  "tip": "<one actionable tip>"
}`,
      });

      const content = response.text || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { ok: false, message: "AI returned invalid format" };
      }
      feedback = JSON.parse(jsonMatch[0]);
    } else {
      return { ok: false, message: `Missing API Key for ${aiProvider}` };
    }

    return { ok: true, feedback };
  } catch (error: any) {
    console.error("[Speaking] Evaluation error:", error);
    return { ok: false, message: error.message || "Evaluation failed" };
  }
}

export interface SpeakingQuestion {
  text: string;
  translation: string;
  source: string;
  vocabWord?: string;
  vocabIpa?: string;
  vocabMeaning?: string;
}

const GENERAL_PROMPTS: { en: string; vi: string }[] = [
  // Daily Life (5)
  { en: "Describe your daily routine in English.", vi: "Mô tả thói quen hàng ngày của bạn bằng tiếng Anh." },
  { en: "What do you usually have for breakfast, and why?", vi: "Bạn thường ăn gì vào bữa sáng, và tại sao?" },
  { en: "Tell me about your neighborhood. What do you like about it?", vi: "Hãy kể về khu phố của bạn. Bạn thích điều gì ở đó?" },
  { en: "How do you usually spend your weekends?", vi: "Bạn thường dành cuối tuần như thế nào?" },
  { en: "What is your favorite thing to cook, and how do you make it?", vi: "Món ăn yêu thích bạn nấu là gì, và cách nấu ra sao?" },
  // Work & Career (5)
  { en: "How would you introduce yourself at a business meeting?", vi: "Bạn sẽ giới thiệu bản thân thế nào trong cuộc họp kinh doanh?" },
  { en: "Describe a challenging project you worked on recently.", vi: "Mô tả một dự án khó khăn bạn đã làm gần đây." },
  { en: "What skills do you think are most important for your job?", vi: "Kỹ năng nào bạn cho là quan trọng nhất cho công việc?" },
  { en: "How do you handle stress at work?", vi: "Bạn xử lý áp lực công việc như thế nào?" },
  { en: "Where do you see yourself professionally in five years?", vi: "Bạn thấy mình ở đâu về mặt nghề nghiệp trong 5 năm tới?" },
  // Travel & Places (5)
  { en: "Describe your favorite place to visit and why.", vi: "Mô tả nơi yêu thích bạn muốn đến và lý do." },
  { en: "Tell me about the best trip you have ever taken.", vi: "Kể về chuyến đi tuyệt vời nhất bạn từng có." },
  { en: "If you could live in any country, where would you choose and why?", vi: "Nếu có thể sống ở bất kỳ quốc gia nào, bạn chọn đâu và tại sao?" },
  { en: "What do you always pack when you travel?", vi: "Bạn luôn mang theo gì khi đi du lịch?" },
  { en: "Describe a memorable experience you had in a foreign country.", vi: "Mô tả một trải nghiệm đáng nhớ ở nước ngoài." },
  // Culture & Entertainment (5)
  { en: "Tell me about a movie you watched recently.", vi: "Kể về một bộ phim bạn xem gần đây." },
  { en: "What kind of music do you enjoy, and why?", vi: "Bạn thích thể loại nhạc nào, và tại sao?" },
  { en: "Describe a book that changed the way you think.", vi: "Mô tả một cuốn sách đã thay đổi cách bạn suy nghĩ." },
  { en: "What is a traditional festival in your country? How do people celebrate it?", vi: "Lễ hội truyền thống nào ở nước bạn? Mọi người tổ chức ra sao?" },
  { en: "Who is your favorite artist or musician? What do you admire about them?", vi: "Nghệ sĩ yêu thích của bạn là ai? Bạn ngưỡng mộ điều gì ở họ?" },
  // Opinions & Debates (5)
  { en: "Do you think social media has more advantages or disadvantages? Explain.", vi: "Bạn nghĩ mạng xã hội có nhiều ưu hay nhược điểm hơn? Giải thích." },
  { en: "Should students learn a foreign language from a young age? Why or why not?", vi: "Học sinh có nên học ngoại ngữ từ nhỏ không? Tại sao?" },
  { en: "Is it better to work from home or in an office? Give reasons.", vi: "Làm việc ở nhà hay văn phòng tốt hơn? Cho lý do." },
  { en: "What do you think about the impact of AI on education?", vi: "Bạn nghĩ gì về tác động của AI đến giáo dục?" },
  { en: "Do you agree that money can buy happiness? Explain your view.", vi: "Bạn có đồng ý tiền có thể mua hạnh phúc không? Giải thích." },
  // Social & Relationships (5)
  { en: "How would you politely complain about a delayed service?", vi: "Bạn sẽ phàn nàn lịch sự về dịch vụ bị trễ như thế nào?" },
  { en: "Describe your best friend. What makes your friendship special?", vi: "Mô tả người bạn thân nhất. Điều gì khiến tình bạn đặc biệt?" },
  { en: "How do you usually make new friends?", vi: "Bạn thường kết bạn mới như thế nào?" },
  { en: "Tell me about a time you helped someone in need.", vi: "Kể về lần bạn giúp đỡ ai đó đang cần." },
  { en: "What qualities do you value most in a colleague?", vi: "Phẩm chất nào bạn đánh giá cao nhất ở đồng nghiệp?" },
  // Health & Lifestyle (5)
  { en: "What do you do to stay healthy?", vi: "Bạn làm gì để giữ sức khỏe?" },
  { en: "Describe your exercise routine, or explain why you don't have one.", vi: "Mô tả thói quen tập thể dục, hoặc giải thích tại sao bạn không có." },
  { en: "How do you deal with difficult emotions like anger or sadness?", vi: "Bạn đối phó với cảm xúc tiêu cực như giận dữ hay buồn bã thế nào?" },
  { en: "What is one healthy habit you want to develop?", vi: "Một thói quen lành mạnh bạn muốn phát triển là gì?" },
  { en: "How has your lifestyle changed in the last few years?", vi: "Lối sống của bạn đã thay đổi thế nào trong vài năm qua?" },
  // Technology (5)
  { en: "How has technology changed the way you learn?", vi: "Công nghệ đã thay đổi cách bạn học như thế nào?" },
  { en: "What is an app or website you use every day? Describe how it helps you.", vi: "Ứng dụng nào bạn dùng hàng ngày? Mô tả nó giúp bạn thế nào." },
  { en: "Do you think we rely too much on smartphones? Why or why not?", vi: "Bạn nghĩ chúng ta phụ thuộc quá nhiều vào điện thoại không?" },
  { en: "Describe a technology that you think will change the world.", vi: "Mô tả một công nghệ bạn nghĩ sẽ thay đổi thế giới." },
  { en: "How do you protect your privacy online?", vi: "Bạn bảo vệ quyền riêng tư trực tuyến như thế nào?" },
  // Education & Learning (5)
  { en: "What do you enjoy most about learning English?", vi: "Bạn thích điều gì nhất khi học tiếng Anh?" },
  { en: "Describe your favorite teacher and what made them special.", vi: "Mô tả giáo viên yêu thích và điều gì khiến họ đặc biệt." },
  { en: "What is the most difficult thing about learning a new language?", vi: "Điều khó nhất khi học ngôn ngữ mới là gì?" },
  { en: "How do you practice English outside of class?", vi: "Bạn luyện tiếng Anh ngoài giờ học như thế nào?" },
  { en: "What skill have you improved this month, and how?", vi: "Kỹ năng nào bạn cải thiện tháng này, và bằng cách nào?" },
  // Hypothetical & Creative (5)
  { en: "If you could have dinner with any person in history, who would it be and why?", vi: "Nếu được ăn tối với bất kỳ ai trong lịch sử, bạn chọn ai và tại sao?" },
  { en: "What would you do if you won the lottery?", vi: "Bạn sẽ làm gì nếu trúng xổ số?" },
  { en: "If you could change one thing about the world, what would it be?", vi: "Nếu có thể thay đổi một điều trên thế giới, đó là gì?" },
  { en: "Imagine you are a tour guide for your city. What would you show visitors?", vi: "Hãy tưởng tượng bạn là hướng dẫn viên du lịch. Bạn sẽ cho khách thấy gì?" },
  { en: "If you could learn any skill instantly, what would you choose?", vi: "Nếu có thể học bất kỳ kỹ năng nào ngay lập tức, bạn chọn gì?" },
];

export async function getSpeakingPrompts(): Promise<{
  questions: SpeakingQuestion[];
}> {
  if (!hasSupabaseConfig()) {
    return {
      questions: GENERAL_PROMPTS
        .sort(() => Math.random() - 0.5)
        .slice(0, 15)
        .map((p) => ({ text: p.en, translation: p.vi, source: "default" })),
    };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { questions: [] };
  }

  // Get recent example sentences from vocabularies
  const { data: examples } = await supabase
    .from("example_sentences")
    .select(`
      sentence,
      translation,
      vocabulary:vocabularies!inner (word, ipa, meaning, lesson_id)
    `)
    .order("created_at", { ascending: false })
    .limit(30);

  const questions: SpeakingQuestion[] = [];

  if (examples && examples.length > 0) {
    const shuffled = examples.sort(() => Math.random() - 0.5).slice(0, 8);
    for (const ex of shuffled) {
      const vocab = ex.vocabulary as any;
      questions.push({
        text: `Use the word "${vocab?.word || ''}" in a sentence and explain what it means.`,
        translation: `Sử dụng từ "${vocab?.word || ''}" trong câu và giải thích nghĩa của nó.`,
        source: "vocabulary",
        vocabWord: vocab?.word,
        vocabIpa: vocab?.ipa || "",
        vocabMeaning: vocab?.meaning || "",
      });
    }
  }

  // Add general conversation prompts
  const shuffledGeneral = [...GENERAL_PROMPTS].sort(() => Math.random() - 0.5).slice(0, 15);
  for (const p of shuffledGeneral) {
    questions.push({ text: p.en, translation: p.vi, source: "general" });
  }

  return { questions };
}

// --- Shadowing Mode Data ---

export interface ShadowingSentence {
  id: string;
  en: string;
  vi: string;
  difficulty: "easy" | "medium" | "hard";
}

const SHADOWING_SENTENCES: ShadowingSentence[] = [
  { id: "s1", en: "I couldn't agree with you more.", vi: "Tôi hoàn toàn đồng ý với bạn.", difficulty: "easy" },
  { id: "s2", en: "That's exactly how I feel about it.", vi: "Đó chính xác là những gì tôi cảm thấy.", difficulty: "easy" },
  { id: "s3", en: "Could you please speak a little slower?", vi: "Bạn có thể nói chậm lại một chút được không?", difficulty: "easy" },
  { id: "s4", en: "It goes without saying that health is wealth.", vi: "Không cần phải nói, sức khỏe là vàng.", difficulty: "medium" },
  { id: "s5", en: "I'd like to point out that there are some issues with this plan.", vi: "Tôi muốn chỉ ra rằng có một số vấn đề với kế hoạch này.", difficulty: "medium" },
  { id: "s6", en: "Let's touch base next week to discuss this further.", vi: "Hãy liên lạc lại vào tuần tới để thảo luận thêm nhé.", difficulty: "medium" },
  { id: "s7", en: "The sheer volume of information available today is truly unprecedented.", vi: "Khối lượng thông tin khổng lồ có sẵn ngày nay thực sự là chưa từng có.", difficulty: "hard" },
  { id: "s8", en: "It’s highly unlikely that the situation will resolve itself without intervention.", vi: "Rất khó có khả năng tình hình sẽ tự giải quyết mà không có sự can thiệp.", difficulty: "hard" }
];

export async function getShadowingSentences(): Promise<{ sentences: ShadowingSentence[] }> {
  return { sentences: SHADOWING_SENTENCES };
}

// --- Roleplay Mode Data & AI ---

export interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  systemPrompt: string;
  firstMessage: string;
}

const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: "restaurant",
    title: "At the Restaurant",
    description: "Practice ordering food, asking for recommendations, and paying the bill.",
    systemPrompt: "You are a friendly waiter at a popular Italian restaurant. Be polite, ask if the customer is ready to order, recommend the Truffle Pasta if asked, and keep your responses relatively short (1-3 sentences) suitable for spoken conversation.",
    firstMessage: "Hello! Welcome to Bella Italia. Here is the menu. Can I get you anything to drink to start off?"
  },
  {
    id: "airport",
    title: "Airport Check-in",
    description: "Check in for your flight, handle baggage issues, and ask for directions.",
    systemPrompt: "You are an airline check-in agent. Be professional but helpful. Ask for passport and ticket, inform the passenger that the flight is slightly delayed, and keep your responses short.",
    firstMessage: "Good morning! Can I see your passport and booking reference, please?"
  },
  {
    id: "job-interview",
    title: "Job Interview",
    description: "Answer common interview questions for a software engineer role.",
    systemPrompt: "You are a hiring manager interviewing a candidate for a software engineer position. Ask about their previous experience, how they handle challenges, and keep your questions professional and concise.",
    firstMessage: "Hi, thanks for coming in today. Let's start with a classic: can you tell me a little bit about yourself?"
  }
];

export async function getRoleplayScenarios(): Promise<{ scenarios: RoleplayScenario[] }> {
  return { scenarios: ROLEPLAY_SCENARIOS };
}

export interface RoleplayMessage {
  role: "user" | "ai";
  content: string;
  feedback?: string; // Grammar feedback on the user's message
}

export async function chatWithAI(
  messages: { role: string; content: string }[],
  scenario: RoleplayScenario
): Promise<{ ok: boolean; responseMessage?: string; feedback?: string; message?: string }> {
  try {
    const aiProvider = process.env.AI_PROVIDER || "gemini";

    // Build the prompt by injecting a rule to return JSON
    // We want the AI to return its response AND a brief feedback on the user's latest grammar.
    const systemPromptWithJSON = `
${scenario.systemPrompt}

You MUST respond with a JSON object exactly like this:
{
  "response": "<your conversational reply to the user>",
  "feedback": "<optional. if the user's last message had grammar errors or sounded unnatural, give a brief 1-sentence tip. if it was good, leave it empty.>"
}
`;

    if (aiProvider === "deepseek" && process.env.DEEPSEEK_API_KEY) {
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({
        baseURL: "https://api.deepseek.com",
        apiKey: process.env.DEEPSEEK_API_KEY,
      });

      const openAiMessages = [
        { role: "system", content: systemPromptWithJSON },
        ...messages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }))
      ];

      const response = await client.chat.completions.create({
        model: "deepseek-v4-flash",
        max_tokens: 1024,
        temperature: 0.6,
        messages: openAiMessages as any,
      });

      const content = response.choices[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI format");
      
      const parsed = JSON.parse(jsonMatch[0]);
      return { ok: true, responseMessage: parsed.response, feedback: parsed.feedback };

    } else if (aiProvider === "gemini" && process.env.GEMINI_API_KEY) {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const formattedHistory = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      
      const prompt = `
${systemPromptWithJSON}

CONVERSATION HISTORY:
${formattedHistory}

Generate your JSON response:`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const content = response.text || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI format");
      
      const parsed = JSON.parse(jsonMatch[0]);
      return { ok: true, responseMessage: parsed.response, feedback: parsed.feedback };
    } else {
      return { ok: false, message: `Missing API Key for ${aiProvider}` };
    }
  } catch (error: any) {
    console.error("[Roleplay] Chat error:", error);
    return { ok: false, message: error.message || "Failed to chat with AI" };
  }
}

