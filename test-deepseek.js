require('dotenv').config();
const { OpenAI } = require('openai');

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
        items: {
          type: "object",
          properties: {
            word: { type: "string" },
            meaning: { type: "string" }
          },
          required: ["word", "meaning"],
          additionalProperties: false
        }
      }
    },
    required: ["vocabularies"],
    additionalProperties: false
  },
  strict: true
};

async function test() {
  console.log("Key:", process.env.DEEPSEEK_API_KEY ? "EXISTS" : "MISSING");
  const prompt = "Hãy trích xuất từ vựng từ câu sau và tuân thủ strict JSON: \n\n" + JSON.stringify(jsonSchema.schema) + "\n\nHello world, my name is AI.";
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
    console.log("RESPONSE:", response.choices[0]?.message?.content);
  } catch(e) {
    console.error("ERROR:", e.message);
  }
}
test();
