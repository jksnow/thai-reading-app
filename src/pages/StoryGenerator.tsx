import React, { useState } from "react";
// Import the mock service for development/testing
// import deepseekService from "../api/mockDeepseekService";
// Uncomment the line below and comment out the mock service when you have a real API key
import deepseekService from "../api/deepseekService";

const genres = [
  "Adventure",
  "Fantasy",
  "Mystery",
  "Science Fiction",
  "Horror",
  "Historical",
  "Fairy Tale",
  "Mythology",
];

const parentalRatings = [
  "G (General Audience)",
  "PG (Parental Guidance)",
  "PG-13 (Parents Strongly Cautioned)",
  "R (Restricted)",
];

const readingLevels = [
  "Age 3-7 (Very Simple vocabulary, short sentences)",
  "Age 7-8 (Simple vocabulary, short sentences)",
  "Age 9-10 (Basic vocabulary, simple sentences)",
  "Age 11-12 (Moderate vocabulary, compound sentences)",
  "Age 13-14 (Rich vocabulary, complex sentences)",
  "Age 15+ (Advanced vocabulary, complex narrative)",
];

interface Choice {
  id: number;
  text: string;
}

interface StorySegment {
  text: string;
  choices: Choice[];
  isEnding: boolean;
}

const StoryGenerator: React.FC = () => {
  const [genre, setGenre] = useState(genres[0]);
  const [parentalRating, setParentalRating] = useState(parentalRatings[0]);
  const [readingLevel, setReadingLevel] = useState(readingLevels[0]);
  const [paragraphs, setParagraphs] = useState(3);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [storyHistory, setStoryHistory] = useState<StorySegment[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);

  const parseStoryResponse = (response: string): StorySegment => {
    // Split the response into story text and choices
    const parts = response.split("\n\n");
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

  const generateInitialStory = async () => {
    setIsGenerating(true);
    setErrorMessage("");

    try {
      const response = await deepseekService.generateInitialStory({
        genre,
        parentalRating,
        readingLevel,
        paragraphs,
      });

      const parsedStory = parseStoryResponse(response);
      setStoryHistory([parsedStory]);
      setCurrentStoryIndex(0);
      setShowChoices(false);
    } catch (error: any) {
      // Display a more user-friendly error message
      setErrorMessage(
        error.message || "Failed to generate story. Please try again."
      );
      console.error("Error details:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const continueStory = async (choiceText: string) => {
    setIsGenerating(true);
    setErrorMessage("");
    setShowChoices(false);

    try {
      // Combine all previous story segments for context
      const storyContext = storyHistory
        .map((segment) => segment.text)
        .join("\n\n");

      const response = await deepseekService.continueStory({
        storyContext,
        userChoice: choiceText,
      });

      const parsedStory = parseStoryResponse(response);

      // Update story history
      setStoryHistory((prev) => [...prev, parsedStory]);
      setCurrentStoryIndex((prev) => prev + 1);
    } catch (error: any) {
      // Display a more user-friendly error message
      setErrorMessage(
        error.message || "Failed to continue story. Please try again."
      );
      console.error("Error details:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShowChoices = () => {
    setShowChoices(true);
  };

  const handleChoiceSelect = (choice: Choice) => {
    continueStory(choice.text);
  };

  const resetStory = () => {
    setStoryHistory([]);
    setCurrentStoryIndex(0);
    setShowChoices(false);
  };

  const currentStory = storyHistory[currentStoryIndex];

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {storyHistory.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">
            Thai Adventure Story Generator
          </h1>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Story Genre
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {genres.map((g) => (
                <option
                  key={g}
                  value={g}
                >
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Parental Rating
            </label>
            <select
              value={parentalRating}
              onChange={(e) => setParentalRating(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {parentalRatings.map((r) => (
                <option
                  key={r}
                  value={r}
                >
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Reading Level
            </label>
            <select
              value={readingLevel}
              onChange={(e) => setReadingLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {readingLevels.map((l) => (
                <option
                  key={l}
                  value={l}
                >
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Number of Paragraphs
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={paragraphs}
              onChange={(e) => setParagraphs(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Recommended: 2-4 paragraphs for optimal story length
            </p>
          </div>

          <button
            onClick={generateInitialStory}
            disabled={isGenerating}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {isGenerating ? "Generating Story..." : "Generate Story"}
          </button>

          {errorMessage && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md border border-red-300">
              <p className="font-medium">Error:</p>
              <p>{errorMessage}</p>
              {errorMessage.includes("API key") && (
                <p className="mt-2 text-sm">
                  To run this app, you need to:
                  <ol className="list-decimal ml-5 mt-1">
                    <li>
                      Create a{" "}
                      <a
                        href="https://api-docs.deepseek.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Deepseek account
                      </a>{" "}
                      and get an API key
                    </li>
                    <li>
                      Create a{" "}
                      <code className="bg-gray-100 px-1 rounded">.env</code>{" "}
                      file in the project root
                    </li>
                    <li>
                      Add{" "}
                      <code className="bg-gray-100 px-1 rounded">
                        VITE_DEEPSEEK_API_KEY=your_key_here
                      </code>{" "}
                      to the file
                    </li>
                    <li>Restart the development server</li>
                  </ol>
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Thai Adventure</h1>
            <button
              onClick={resetStory}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              New Story
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
            {currentStory.text}
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {errorMessage}
            </div>
          )}

          {currentStory.isEnding ? (
            <div className="text-center p-4 bg-yellow-100 rounded-lg mb-4">
              <p className="font-medium text-lg">The End</p>
              <p className="text-gray-600">Your adventure has concluded.</p>
            </div>
          ) : showChoices ? (
            <div className="space-y-3 mt-6">
              <h2 className="font-medium text-lg">Choose your next action:</h2>
              {currentStory.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceSelect(choice)}
                  className="block w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  disabled={isGenerating}
                >
                  {choice.id}. {choice.text}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={handleShowChoices}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none"
            >
              What Will You Do Next?
            </button>
          )}

          {isGenerating && (
            <div className="text-center mt-4 p-3 bg-blue-100 text-blue-700 rounded-md">
              Generating next part of your adventure...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryGenerator;
