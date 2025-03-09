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

// Configuration
const API_KEY = process.env.REACT_APP_DEEPSEEK_API_KEY || "";
const BASE_URL = "https://api.deepseek.com";

// Helper function to format the initial story prompt
const formatPrompt = (storyOptions: StoryOptions): string => {
  return `
    Generate a "choose your own adventure" story in Thai language with the following specifications:
    
    - Genre/Theme: ${storyOptions.genre}
    - Parental Rating: ${storyOptions.parentalRating}
    - Reading Level: ${storyOptions.readingLevel}
    - Number of paragraphs: ${storyOptions.paragraphs}
    
    Important formatting requirements:
    1. Place a space between EACH Thai word to make it easier for beginners to read
    2. Write a compelling opening to the story (${storyOptions.paragraphs} paragraphs)
    3. At the end, provide exactly 4 numbered choices for how the reader can continue the story
    4. Format the choices as: "1. [choice 1]", "2. [choice 2]", etc.
    5. Make the choices meaningful and significantly different from each other
    6. Each choice should lead the story in a completely different direction
    
    Structure the response with:
    - The story segment in Thai (with spaces between all words)
    - A blank line
    - The 4 numbered choices
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
    
    Important formatting requirements:
    1. Place a space between EACH Thai word to make it easier for beginners to read
    2. Continue the story based on the reader's choice (3-4 paragraphs)
    3. At the end, provide exactly 4 numbered choices for how the reader can continue the story
    4. Format the choices as: "1. [choice 1]", "2. [choice 2]", etc.
    5. Make the choices meaningful and significantly different from each other
    6. Each choice should lead the story in a completely different direction
    7. If the story reaches a natural conclusion, indicate "THE END" instead of giving choices
    
    Structure the response with:
    - The story segment in Thai (with spaces between all words)
    - A blank line
    - The 4 numbered choices (or "THE END" if the story concludes)
  `;
};

// Function to generate initial story
const generateInitialStory = async (
  storyOptions: StoryOptions
): Promise<string> => {
  try {
    const prompt = formatPrompt(storyOptions);

    const response = await axios.post(
      `${BASE_URL}/v1/chat/completions`,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating story:", error);
    throw new Error("Failed to generate story");
  }
};

// Function to continue the story based on user choice
const continueStory = async (
  options: ContinueStoryOptions
): Promise<string> => {
  try {
    const prompt = formatContinuePrompt(options);

    const response = await axios.post(
      `${BASE_URL}/v1/chat/completions`,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error continuing story:", error);
    throw new Error("Failed to continue story");
  }
};

// Export the functions to be used by other components
const deepseekService = {
  generateInitialStory,
  continueStory,
};

export default deepseekService;
