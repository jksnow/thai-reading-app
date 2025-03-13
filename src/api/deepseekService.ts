import axios from "axios";
import storyModifiers from "../data/storyModifiers";

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
  storyContext: string;
  storyGoal: string;
  summary: string;
  userChoice: string;
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

const systemPrompt = (
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
      ? `\nThe story should include the following modifiers:\n${modifiers
          .map(
            (mod) =>
              `- ${mod?.category}: ${mod?.modifier} (${mod?.description})`
          )
          .join("\n")}`
      : "";

  return `
  You are a professional creative story writer. You write stories in the thai language. You understand how to make a captivating story for all age levels to enjoy..
  Create a "choose your own adventure" story in the Thai language. You will write the story in parts and then create options for the user to continue the story.

  - Genre/Theme: ${storyOptions.genre}
  - Parental Rating: ${storyOptions.parentalRating}
  - Reading Level: ${storyOptions.readingLevel}
  - Number of paragraphs: ${storyOptions.paragraphs}${modifiersText}

  Format and extra instructions:
  Write [GOAL] and then write a story conclusion goal. Think of what would make a good ending to the story.
  Write [STORY] and then write the story in thai based on the story criteria above. The story should build to the goal but not too quickly or forced. Don't be too predictable.
  Write [SUMMARY] and then write a story summary in english: summarize the important beats of the story. No more than 1 paragraph.
  If the story has reached the goal, write THE END
  If the story has not reached the goal write [CHOICES] and then write 3 numbered choices to continue the story.
  example format:
  1. choice 1
  2. choice 2
  3. choice 3

  Format requirements:
  Put a space between each Thai word. Period (.) at each sentence end.
  Before the name of a character add [name] to indicate that it is a name with no space between [name] and the name written.
  example: [name]เจฟฟ์
  do not add [name] before name descriptors like คุณ or น้องหญิง. only before the actual name.
`;
};

// Helper function to format the initial story prompt
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
      ? `\nSelected Modifiers:\n${modifiers
          .map(
            (mod) =>
              `- ${mod?.category}: ${mod?.modifier} (${mod?.description})`
          )
          .join("\n")}`
      : "";

  return `
    - Genre/Theme: ${storyOptions.genre}
    - Parental Rating: ${storyOptions.parentalRating}
    - Reading Level: ${storyOptions.readingLevel}
    - Number of paragraphs: ${storyOptions.paragraphs}${modifiersText}
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
      ? `\nThe story should continue to include the following modifiers:\n${modifiers
          .map(
            (mod) =>
              `- ${mod?.category}: ${mod?.modifier} (${mod?.description})`
          )
          .join("\n")}`
      : "";

  return `
    Continue the story based on the user's choice.
    
    Story goal:
    ${options.storyGoal}

    Previous story summary:
    ${options.summary}
    
    Previous story context:
    ${options.storyContext}
    
    User selected:
    ${options.userChoice}${modifiersText}
    
    Continue the story based on this choice. Follow the same formatting requirements.

    Response must start with:
    Write [GOAL] and use the same story goal provided above. 
    Write [STORY] and then continue the story.
    Write [SUMMARY] to summarize the story so far in english.
    If the story has reached the goal, write THE END
    If the story has not reached the goal write [CHOICES] and then write exactly 3 numbered choices to continue the story.
  `;
};

// Function to generate initial story
const generateInitialStory = async (
  storyOptions: StoryOptions,
  selectedModifiers: string[] = []
): Promise<string> => {
  if (!API_KEY) {
    throw new Error(
      "Deepseek API key is missing. Please add VITE_DEEPSEEK_API_KEY to your .env file and restart the application."
    );
  }

  return measureApiDuration(async () => {
    try {
      // Use the system prompt with modifiers included
      const prompt = systemPrompt(storyOptions, selectedModifiers);

      // Updating to match the exact endpoint from documentation
      const response = await axios.post(
        `${BASE_URL}/chat/completions`,
        {
          // "deepseek-chat" is the default model
          // "deepseek-reasoner" is the model for reasoning tasks
          // reasoner is 2x more expensive during standard hours（UTC 00:30-16:30）
          // but reasoner is the same price (75% off) as the chat model during（UTC 16:30-00:30）
          model: "deepseek-reasoner",
          messages: [
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
  });
};

// Function to continue the story based on user choice
const continueStory = async (
  options: ContinueStoryOptions,
  selectedModifiers: string[] = []
): Promise<string> => {
  if (!API_KEY) {
    throw new Error(
      "Deepseek API key is missing. Please add VITE_DEEPSEEK_API_KEY to your .env file and restart the application."
    );
  }

  return measureApiDuration(async () => {
    try {
      const prompt = formatContinuePrompt(options, selectedModifiers);

      // Updating to match the exact endpoint from documentation
      const response = await axios.post(
        `${BASE_URL}/chat/completions`,
        {
          model: "deepseek-reasoner",
          messages: [
            {
              role: "system",
              content: systemPrompt(
                {
                  genre: "Follow previous context",
                  parentalRating: "Follow previous context",
                  readingLevel: "Follow previous context",
                  paragraphs: 3,
                },
                selectedModifiers
              ),
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
  });
};

// Export the functions to be used by other components
const deepseekService = {
  generateInitialStory,
  continueStory,
};

export default deepseekService;
