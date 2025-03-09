import axios from "axios";

interface StoryOptions {
  genre: string;
  parentalRating: string;
  readingLevel: string;
  paragraphs: number;
}

interface ContinueStoryOptions {
  storyContext: string;
  userChoice: string;
}

const temperature: number = 1.5;
const max_tokens: number = 2000;

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

const systemPrompt = `
  You are a professional storyteller.
  You are tasked with generating a "choose your own adventure" story in the Thai language.
  Important formatting requirements:
  1. Place a space between EACH Thai word and a period between each sentence but don't add a space after final word of sentence.
  
  3. Make the choices meaningful and significantly different from each other
  4. Each choice should lead the story in a completely different direction
  The story should be engaging and interesting.

  If there are choices at the end of the current story segment, Structure like the following:
  - the story segment
  - A blank line
  - The 4 numbered choices, Format the choices as: "1. [choice 1]", "2. [choice 2]", etc.

  If the story reaches a natural conclusion, indicate "THE END" instead of giving choices
`;

// Helper function to format the initial story prompt
const formatPrompt = (storyOptions: StoryOptions): string => {
  return `
    - Genre/Theme: ${storyOptions.genre}
    - Parental Rating: ${storyOptions.parentalRating}
    - Reading Level: ${storyOptions.readingLevel}
    - Number of paragraphs: ${storyOptions.paragraphs}
    
    At the end, in a new line, write [CHOICES] and then provide exactly 4 numbered choices for how the reader can continue the story
  `;
};

// Helper function to format the continue story prompt
const formatContinuePrompt = (options: ContinueStoryOptions): string => {
  return `
    Continue the following "choose your own adventure" story in Thai language.
    
    Previous story context:
    ${options.storyContext}
    
    The reader chose:
    ${options.userChoice}
  `;
};

// Function to generate initial story
const generateInitialStory = async (
  storyOptions: StoryOptions
): Promise<string> => {
  if (!API_KEY) {
    throw new Error(
      "Deepseek API key is missing. Please add VITE_DEEPSEEK_API_KEY to your .env file and restart the application."
    );
  }

  try {
    const prompt = formatPrompt(storyOptions);

    // Updating to match the exact endpoint from documentation
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
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

    return response.data.choices[0].message.content;
  } catch (error: any) {
    // Enhanced error handling
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error(
          "Authentication failed: Your Deepseek API key is invalid or expired. Please check and update your API key."
        );
      } else if (error.response) {
        throw new Error(
          `API error (${error.response.status}): ${
            error.response.data?.error?.message || error.message
          }`
        );
      } else if (error.request) {
        throw new Error(
          "Network error: Could not connect to Deepseek API. Please check your internet connection."
        );
      }
    }
    console.error("Error generating story:", error);
    throw new Error(`Failed to generate story: ${error.message}`);
  }
};

// Function to continue the story based on user choice
const continueStory = async (
  options: ContinueStoryOptions
): Promise<string> => {
  if (!API_KEY) {
    throw new Error(
      "Deepseek API key is missing. Please add VITE_DEEPSEEK_API_KEY to your .env file and restart the application."
    );
  }

  try {
    const prompt = formatContinuePrompt(options);

    // Updating to match the exact endpoint from documentation
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
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

    return response.data.choices[0].message.content;
  } catch (error: any) {
    // Enhanced error handling
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error(
          "Authentication failed: Your Deepseek API key is invalid or expired. Please check and update your API key."
        );
      } else if (error.response) {
        throw new Error(
          `API error (${error.response.status}): ${
            error.response.data?.error?.message || error.message
          }`
        );
      } else if (error.request) {
        throw new Error(
          "Network error: Could not connect to Deepseek API. Please check your internet connection."
        );
      }
    }
    console.error("Error continuing story:", error);
    throw new Error(`Failed to continue story: ${error.message}`);
  }
};

// Export the functions to be used by other components
const deepseekService = {
  generateInitialStory,
  continueStory,
};

export default deepseekService;
