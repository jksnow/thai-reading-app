import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DEEPSEEK_API_KEY) {
  console.error("DEEPSEEK_API_KEY is not set in environment variables");
}

const API_KEY = process.env.DEEPSEEK_API_KEY || "";
const BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const temperature: number = 1.5;
const max_tokens: number = 3000;

export async function generateCompletion(
  prompt: string
): Promise<string | null> {
  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    return response.data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    throw error;
  }
}
