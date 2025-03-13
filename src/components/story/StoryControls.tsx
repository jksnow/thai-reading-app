import React from "react";
import { StoryParams } from "../../utils/storyUtils";
import ShaderButton from "../ShaderButton";

// Constants for dropdown options
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
  "G (Everyone)",
  "PG (Parental Guidance)",
  "PG-13 (Teens)",
  "R (17+)",
];

const readingLevels = [
  "Age 5-7 (Very basic vocabulary First 500 words you learn in school)",
  "Age 8-10 (Basic vocabulary, simple sentences)",
  "Age 11-12 (Moderate vocabulary, compound sentences)",
  "Age 13-14 (Rich vocabulary, complex sentences)",
  "Age 15+ (Advanced vocabulary, complex narrative)",
];

interface StoryControlsProps {
  params: StoryParams;
  onParamsChange: (params: Partial<StoryParams>) => void;
  onGenerateStory: () => void;
  isGenerating: boolean;
}

const StoryControls: React.FC<StoryControlsProps> = ({
  params,
  onParamsChange,
  onGenerateStory,
  isGenerating,
}) => {
  return (
    <div className="adventure-container p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-ink mb-6 font-serif text-center">
        Choose your story options.
      </h1>

      <div className="mb-4">
        <label className="block text-ink font-medium mb-2">Story Genre</label>
        <select
          value={params.genre}
          onChange={(e) => onParamsChange({ genre: e.target.value })}
          className="w-full px-3 py-2 border border-parchment-dark bg-white text-ink rounded-md focus:outline-none focus:ring-2 focus:ring-accent-tertiary focus:border-accent-tertiary"
        >
          {genres.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-ink font-medium mb-2">
          Parental Rating
        </label>
        <select
          value={params.parentalRating}
          onChange={(e) => onParamsChange({ parentalRating: e.target.value })}
          className="w-full px-3 py-2 border border-parchment-dark bg-white text-ink rounded-md focus:outline-none focus:ring-2 focus:ring-accent-tertiary focus:border-accent-tertiary"
        >
          {parentalRatings.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-ink font-medium mb-2">Reading Level</label>
        <select
          value={params.readingLevel}
          onChange={(e) => onParamsChange({ readingLevel: e.target.value })}
          className="w-full px-3 py-2 border border-parchment-dark bg-white text-ink rounded-md focus:outline-none focus:ring-2 focus:ring-accent-tertiary focus:border-accent-tertiary"
        >
          {readingLevels.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-ink font-medium mb-2">
          Number of Paragraphs
        </label>
        <input
          type="number"
          min="1"
          max="5"
          value={params.paragraphs}
          onChange={(e) =>
            onParamsChange({
              paragraphs: Math.max(
                1,
                Math.min(5, parseInt(e.target.value) || 1)
              ),
            })
          }
          className="w-full px-3 py-2 border border-parchment-dark bg-white text-ink rounded-md focus:outline-none focus:ring-2 focus:ring-accent-tertiary focus:border-accent-tertiary"
        />
      </div>

      <div className="flex justify-center">
        <ShaderButton
          onClick={onGenerateStory}
          disabled={isGenerating}
          className="px-6 py-3 rounded-lg text-lg font-medium text-white"
        >
          {isGenerating ? "Generating..." : "Generate Story"}
        </ShaderButton>
      </div>
    </div>
  );
};

export default StoryControls;
