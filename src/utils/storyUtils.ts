// Story utility functions

export interface Choice {
  id: number;
  text: string;
}

export interface StorySegment {
  text: string;
  choices: Choice[];
  isEnding: boolean;
}

export interface StoryParams {
  genre: string;
  parentalRating: string;
  readingLevel: string;
  paragraphs: number;
}

/**
 * Parse the raw response from the AI service into a structured StorySegment
 */
export const parseStoryResponse = (response: string): StorySegment => {
  // Split the response into story text and choices
  const parts = response.split("[CHOICES]");
  const storyText = parts[0];

  let choices: Choice[] = [];
  let isEnding = false;

  // Check if the story has reached an ending
  if (parts.length > 1 && parts[1].includes("THE END")) {
    isEnding = true;
  } else if (parts.length > 1) {
    // Parse the choices
    const choicesText = parts[1];
    const choiceLines = choicesText.split("\n");

    choices = choiceLines
      .filter((line) => /^\d+\./.test(line)) // Filter lines that start with a number and dot
      .map((line, index) => {
        const match = line.match(/^\d+\.\s*(.*)/);
        return {
          id: index + 1,
          text: match ? match[1] : line,
        };
      });
  }

  return {
    text: storyText,
    choices,
    isEnding,
  };
};

/**
 * Check if a word is standalone punctuation
 */
export const isPunctuation = (word: string): boolean => {
  return /^[.,?!;:]$/.test(word);
};

/**
 * Get the CSS class for font size
 */
export const getFontSizeClass = (size: string): string => {
  switch (size) {
    case "small":
      return "text-base leading-loose";
    case "medium":
      return "text-xl leading-loose";
    case "large":
      return "text-2xl leading-loose";
    default:
      return "text-xl leading-loose";
  }
};
