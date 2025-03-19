import axios from "axios";
import storyModifiers from "../data/storyModifiers";
import { cleanMarkdownJSON } from "../utils/storyUtils";

// Track API response time events
type ResponseTimeCallback = (timeInMs: number) => void;
let apiResponseTimeCallback: ResponseTimeCallback | null = null;

// Function to set the response time callback
export const setApiResponseTimeCallback = (
  callback: ResponseTimeCallback | null
) => {
  apiResponseTimeCallback = callback;
};

// Helper function to measure API call duration
const measureApiDuration = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  const startTime = Date.now();
  try {
    console.log("Starting API call timing measurement...");
    const result = await apiCall();
    const duration = Date.now() - startTime;

    // Call the callback if it's set
    if (apiResponseTimeCallback) {
      console.log(`API call took ${duration}ms, recording measurement`);
      apiResponseTimeCallback(duration);
    } else {
      console.log(
        `API call took ${duration}ms, but no callback registered to record it`
      );
    }

    return result;
  } catch (error) {
    // Still record the time even if there's an error
    const duration = Date.now() - startTime;
    console.error(`API call failed after ${duration}ms`);
    throw error;
  }
};

interface StoryOptions {
  genre: string;
  parentalRating: string;
  readingLevel: string;
  paragraphs: number;
}

interface ContinueStoryOptions {
  storySummary: string;
  storyGoal: string;
  userChoice: string;
  genre: string;
  parentalRating: string;
  readingLevel: string;
  paragraphs: number;
  summary: string;
}

const temperature: number = 1.5;
const max_tokens: number = 3000;

// Configuration
// Vite uses import.meta.env instead of process.env
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || "";
// Based on official documentation at https://api-docs.deepseek.com/
const BASE_URL =
  import.meta.env.VITE_DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";

// Check API key and display developer-friendly message
if (!API_KEY) {
  console.error(
    "⚠️ VITE_DEEPSEEK_API_KEY is not set. Please add it to your .env file."
  );
}

const formatPrompt = (
  storyOptions: StoryOptions,
  selectedModifierIds: string[] = []
): string => {
  // Get the full modifier objects from their IDs
  const modifiers = selectedModifierIds
    .map((id) => storyModifiers.find((mod) => mod.id === id))
    .filter(Boolean);

  // Format the modifiers for the prompt
  const modifiersText =
    modifiers.length > 0
      ? `\nThe story should include the following creative writing modifiers:\n${modifiers
          .map(
            (mod) =>
              `- ${mod?.category}: ${mod?.modifier} (${mod?.description})`
          )
          .join("\n")}`
      : "";
  return `You are a professional creative writer specializing in Thai language stories. You craft captivating "choose your own adventure" stories suitable for all age levels. Your task is to generate a story part based on the provided criteria and return the response in a structured JSON format.

Story Criteria:
- Genre/Theme: ${storyOptions.genre}
- Parental Rating: ${storyOptions.parentalRating}
- Reading Level: ${storyOptions.readingLevel}
- Number of Paragraphs: ${storyOptions.paragraphs}${modifiersText}

Instructions:
1. Create a story conclusion goal that would make an engaging ending, considering the genre and theme.
2. Write the story part in Thai, building toward the goal naturally without rushing or being too predictable. Use ${storyOptions.paragraphs} paragraphs.
3. Provide a summary of the story part in English, highlighting key events in no more than one paragraph.
4. If the story reaches the goal, indicate it has ended. If not, provide 3 numbered choices for the user to continue the story.

Formatting Requirements:
- In the Thai story text, put a space between each complete word (not between individual letters or syllables within a word) and end each sentence with a period (.). For example: "คุณ เดิน เข้า ไป ใน ป่า" (correct), NOT "ค ุ ณ เ ดิ น" (incorrect).
- Write character names naturally in Thai without adding any special tags (e.g., just "สมชาย", not "[name]สมชาย").

Response Format:
Return the entire response as a single JSON object with the following structure:
- "goal": A string describing the story's conclusion goal in English.
- "story": A string containing the Thai story text with specified formatting.
- "summary": A string with the English summary of the story part, using the same character names as listed in "character_names" (e.g., if "สมชาย" is in the story, use "Somchai" in the summary).
- "is_complete": A boolean indicating if the story has reached the goal (true) or not (false).
- "character_names": An array of strings containing the exact Thai names of characters as they appear in the story (e.g., "สมชาย").
- "choices": An array of 3 strings (each a numbered choice like "1. choice text") if is_complete is false; an empty array if true. Choices should use character names consistently with "character_names".

Example JSON Response:
{
  "goal": "Our characters must find the hidden treasure in the ancient temple.",
  "story": "คุณ เดิน เข้า ไป ใน ป่า ที่ มืด มิด . สมชาย เพื่อน ของ คุณ เดิน ตาม มา . คุณ เห็น แสง สว่าง ลาง ๆ ข้าง หน้า .",
  "summary": "You enter a dark forest with your friend Somchai, noticing a faint light ahead.",
  "is_complete": false,
  "character_names": ["สมชาย"],
  "choices": [
    "1. เดิน ไป ยัง แสง สว่าง",
    "2. หยุด และ ตรวจ สอบ รอบ ๆ",
    "3. เรียก หา สมชาย เพื่อ วาง แผน"
  ]
}
OR
{
  "goal": "Escape the haunted house.",
  "story": "คุณ เปิด ประตู และ วิ่ง ออก มา . อรุณ เพื่อน ของ คุณ รอ อยู่ ข้าง นอก . คุณ ปลอดภัย แล้ว .",
  "summary": "You open the door and escape the haunted house, finding your friend Arun waiting outside.",
  "is_complete": true,
  "character_names": ["อรุณ"],
  "choices": []
}

Key Clarifications:
- Ensure spacing in the Thai story text is between whole words only, as shown in the examples. Do not space between letters within a word. 
- Ensure if a word is made of multiple word sections (example: นักท่องเที่ยว) don't space each word section. The entire word should be written together.
- Use the exact names from "character_names" in both the story (written naturally in Thai) and summary (transliterated to English), maintaining consistency (e.g., "สมชาย" in story = "Somchai" in summary).
- Do not add any tags like [name] before character names in the story text; write them as plain Thai names.

Now, generate the JSON response based on the criteria above.
`;
};

// Helper function to format the continue story prompt
const formatContinuePrompt = (
  options: ContinueStoryOptions,
  selectedModifierIds: string[] = []
): string => {
  // Get the full modifier objects from their IDs
  const modifiers = selectedModifierIds
    .map((id) => storyModifiers.find((mod) => mod.id === id))
    .filter(Boolean);

  // Format the modifiers for the prompt
  const modifiersText =
    modifiers.length > 0
      ? `\nThe story should continue to include the following creative writing modifiers:\n${modifiers
          .map(
            (mod) =>
              `- ${mod?.category}: ${mod?.modifier} (${mod?.description})`
          )
          .join("\n")}`
      : "";

  return `You are a professional creative writer specializing in Thai language stories. You craft captivating "choose your own adventure" stories suitable for all age levels. Your task is to continue an existing story part based on the user's selected choice, building toward the provided story goal, and return the response in a structured JSON format.

Story Continuation Criteria:
- Story Goal: ${options.storyGoal}
- Previous Story Summary (English): ${options.storySummary}
- User's Selected Choice: ${options.userChoice}
- Genre/Theme: ${options.genre || "Continue in the established style"}
- Parental Rating: ${options.parentalRating || "Match previous rating"}
- Reading Level: ${options.readingLevel || "Match previous level"}
- Number of Paragraphs: ${
    options.paragraphs || "Match previous length"
  }${modifiersText}

Instructions:
1. Use the provided story goal as the ultimate conclusion to work toward.
2. Continue the story from the previous context in Thai, incorporating the user's selected choice naturally and advancing the narrative toward the goal without rushing or being too predictable. Use ${
    options.paragraphs || "the same number of"
  } paragraphs as the previous part unless specified otherwise.
3. Provide an updated summary of the entire story so far in English, including key events from the previous part and this continuation, in no more than one paragraph.
4. If the story reaches the goal, indicate it has ended. If not, provide 3 numbered choices for the user to continue the story.

Formatting Requirements:
- In the Thai story text, put a space between each complete word (not between individual letters or syllables within a word) and end each sentence with a period (.). For example: "คุณ เดิน เข้า ไป ใน ป่า" (correct), NOT "ค ุ ณ เ ดิ น" (incorrect).
- Write character names naturally in Thai without adding any special tags (e.g., just "สมชาย", not "[name]สมชาย").
- Ensure if a word is made of multiple word sections (e.g., นักท่องเที่ยว), write it together without spacing each section.

Response Format:
Return the entire response as a single JSON object with the following structure:
- "goal": A string with the same story conclusion goal in English as provided.
- "story": A string containing the continued Thai story text with specified formatting.
- "summary": A string with the updated English summary of the story so far, using the same character names as listed in "character_names" (e.g., "สมชาย" in story = "Somchai" in summary).
- "is_complete": A boolean indicating if the story has reached the goal (true) or not (false).
- "character_names": An array of strings containing the exact Thai names of characters as they appear in the story (e.g., "สมชาย").
- "choices": An array of 3 strings (each a numbered choice like "1. choice text") if is_complete is false; an empty array if true. Choices should use character names consistently with "character_names".

Example JSON Response:
{
  "goal": "Our characters must find the hidden treasure in the ancient temple.",
  "story": "คุณ เดิน ไป ยัง แสง สว่าง ตาม ที่ เลือก . สมชาย ชี้ ไป ที่ ถ้ำ ข้าง หน้า . คุณ ทั้ง สอง เข้า ไป และ พบ กล่อง ไม้ เก่า ๆ .",
  "summary": "You and Somchai follow the faint light into a cave, where you discover an old wooden box.",
  "is_complete": false,
  "character_names": ["สมชาย"],
  "choices": [
    "1. เปิด กล่อง ไม้",
    "2. ตรวจ สอบ ถ้ำ ให้ ละเอียด",
    "3. เรียก สมชาย ให้ ช่วย ยก กล่อง"
  ]
}
OR
{
  "goal": "Escape the haunted house.",
  "story": "คุณ วิ่ง ออก มา จาก ห้อง มืด ตาม ทาง ที่ เลือก . อรุณ รอ อยู่ ที่ ประตู หน้า . คุณ ทั้ง สอง ปลอดภัย แล้ว .",
  "summary": "You escape the dark room and meet Arun at the front door, safely leaving the haunted house.",
  "is_complete": true,
  "character_names": ["อรุณ"],
  "choices": []
}

Key Clarifications:
- Maintain the same tone, style, and formatting as the previous story part, adapting naturally to the user's choice.
- Use the exact names from "character_names" in both the story (written naturally in Thai) and summary (transliterated to English), ensuring consistency (e.g., "สมชาย" in story = "Somchai" in summary).
- Do not add any tags like [name] before character names in the story text; write them as plain Thai names.

Now, generate the JSON response based on the criteria above.
`;
};

// Function to generate initial story
const generateInitialStory = async (
  storyOptions: StoryOptions,
  selectedModifiers: string[] = []
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API key not found");
  }

  const messages = [
    {
      role: "user",
      content: formatPrompt(storyOptions, selectedModifiers),
    },
  ];

  return measureApiDuration(async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/chat/completions`,
        {
          model: "deepseek-chat",
          messages,
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

      // Clean any markdown formatting from the response
      return cleanMarkdownJSON(response.data.choices[0].message.content);
    } catch (error) {
      console.error("Error generating initial story:", error);
      throw error;
    }
  });
};

// Function to continue the story based on user choice
const continueStory = async (
  options: ContinueStoryOptions,
  selectedModifiers: string[] = []
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API key not found");
  }

  const messages = [
    {
      role: "user",
      content: formatContinuePrompt(options, selectedModifiers),
    },
  ];

  return measureApiDuration(async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/chat/completions`,
        {
          model: "deepseek-chat",
          messages,
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

      // Clean any markdown formatting from the response
      return cleanMarkdownJSON(response.data.choices[0].message.content);
    } catch (error) {
      console.error("Error continuing story:", error);
      throw error;
    }
  });
};

// Export the functions to be used by other components
const deepseekService = {
  generateInitialStory,
  continueStory,
};

export default deepseekService;
