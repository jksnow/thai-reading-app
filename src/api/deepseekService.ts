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

const systemPrompt = (storyOptions: StoryOptions): string => {
  return `
  You are a professional creative story writer. You write in the thai language. You understand how to make a captivating story for all age levels to enjoy..
  Create a "choose your own adventure" story in the Thai language. You will write the story in parts and then create options for the user to continue the story.

  - Genre/Theme: ${storyOptions.genre}
  - Parental Rating: ${storyOptions.parentalRating}
  - Reading Level: ${storyOptions.readingLevel}
  - Number of paragraphs: ${storyOptions.paragraphs}

  Response start:
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
`;
};

// const systemPrompt = `
//   You are a professional creative storyteller.
//   You are tasked with generating a "choose your own adventure" story in the Thai language with the goal of the user practicing reading Thai and learning new words.
//   Important formatting requirements:
//   1. Place a space between EACH Thai word and a period between each sentence but don't add a space after final word of each sentence.
//   2. Make the choices meaningful and significantly different from each other
//   3. Each choice should lead the story in a completely different direction
//   4. Before each name of a character, add -name- to indicate that it is a name with no space between -name- and the name written.
//   5. Before the story, think of 3 words that are important for someone to learn, add them to the beginning of the story in a list written with brackets around them [word1] etc.
//   6. The story should be engaging and interesting.
//   7. Write a BRIEF goal or end condition of the story and write [GOAL] after the goal. The story should build to this goal but can deviate for creativity.
//   8. Write a BRIEF summary of the story so far. Write [SUMMARY] after the summary then start the story.
//   9. At the end, in a new line, write [CHOICES] and then provide exactly 3 numbered choices for how the reader can continue the story.
//   10. Format the 3 numbered choices like: "1. [choice 1]", "2. [choice 2]", "3. [choice 3]"

//   If the story reaches a natural conclusion or the goal is reached, indicate "THE END" instead of giving choices
// `;

// Helper function to format the initial story prompt
const formatPrompt = (storyOptions: StoryOptions): string => {
  return `
    - Genre/Theme: ${storyOptions.genre}
    - Parental Rating: ${storyOptions.parentalRating}
    - Reading Level: ${storyOptions.readingLevel}
    - Number of paragraphs: ${storyOptions.paragraphs}
  `;
};

// Helper function to format the continue story prompt
const formatContinuePrompt = (options: ContinueStoryOptions): string => {
  return `
    Continue the following "choose your own adventure" story in Thai language.
    
    Story goal:
    ${options.storyGoal}

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
    // const prompt = formatPrompt(storyOptions);
    const prompt = systemPrompt(storyOptions);

    // Updating to match the exact endpoint from documentation
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: "deepseek-chat",
        messages: [
          // {
          //   role: "system",
          //   content: systemPrompt,
          // },
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
