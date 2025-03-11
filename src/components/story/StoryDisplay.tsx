import React from "react";
import { Choice, StorySegment } from "../../utils/storyUtils";
import ThaiWordRenderer from "./ThaiWordRenderer";
import ShaderButton from "../ShaderButton";

interface StoryDisplayProps {
  storyHistory: StorySegment[];
  currentStoryIndex: number;
  showChoices: boolean;
  isGenerating: boolean;
  fontSizeClass: string;
  showWordSpacing: boolean;
  onWordClick: (word: string, event: React.MouseEvent) => void;
  onShowChoices: () => void;
  onChoiceSelect: (choice: Choice) => void;
  onResetStory: () => void;
  onToggleWordSpacing: () => void;
  onFontSizeChange: (size: string) => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({
  storyHistory,
  currentStoryIndex,
  showChoices,
  isGenerating,
  fontSizeClass,
  showWordSpacing,
  onWordClick,
  onShowChoices,
  onChoiceSelect,
  onResetStory,
  onToggleWordSpacing,
  onFontSizeChange,
}) => {
  const currentStory = storyHistory[currentStoryIndex];

  return (
    <div className="adventure-container p-8 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-ink font-serif">
          Your Adventure
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => onFontSizeChange("small")}
            className={`px-2 py-1 rounded ${
              fontSizeClass.includes("text-base")
                ? "bg-accent-tertiary text-white"
                : "bg-gray-200"
            }`}
          >
            A-
          </button>
          <button
            onClick={() => onFontSizeChange("medium")}
            className={`px-2 py-1 rounded ${
              fontSizeClass.includes("text-xl") &&
              !fontSizeClass.includes("text-2xl")
                ? "bg-accent-tertiary text-white"
                : "bg-gray-200"
            }`}
          >
            A
          </button>
          <button
            onClick={() => onFontSizeChange("large")}
            className={`px-2 py-1 rounded ${
              fontSizeClass.includes("text-2xl")
                ? "bg-accent-tertiary text-white"
                : "bg-gray-200"
            }`}
          >
            A+
          </button>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={onToggleWordSpacing}
          className={`px-3 py-2 rounded text-sm ${
            showWordSpacing ? "bg-accent-tertiary text-white" : "bg-gray-200"
          }`}
        >
          {showWordSpacing ? "Spaced Words" : "Connected Words"}
        </button>
      </div>

      <div className={`story-text mb-6 ${fontSizeClass}`}>
        <ThaiWordRenderer
          text={currentStory.text}
          showWordSpacing={showWordSpacing}
          onWordClick={onWordClick}
        />
      </div>

      {currentStory.choices.length > 0 && !currentStory.isEnding && (
        <div className="choices mb-6">
          {showChoices ? (
            <>
              <h2 className="text-lg font-semibold mb-2 text-ink">
                Choose your path:
              </h2>
              <div className="space-y-2">
                {currentStory.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => onChoiceSelect(choice)}
                    disabled={isGenerating}
                    className="block w-full px-4 py-2 bg-parchment hover:bg-parchment-dark text-left rounded transition-colors duration-200"
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center">
              <ShaderButton
                onClick={onShowChoices}
                className="px-4 py-2 rounded text-white"
              >
                What will you do next?
              </ShaderButton>
            </div>
          )}
        </div>
      )}

      {currentStory.isEnding && (
        <div className="ending-message mb-6 text-center">
          <p className="text-lg font-bold text-accent-tertiary mb-4">
            The End of Your Adventure
          </p>
          <ShaderButton
            onClick={onResetStory}
            className="px-4 py-2 rounded text-white"
          >
            Start a New Adventure
          </ShaderButton>
        </div>
      )}
    </div>
  );
};

export default StoryDisplay;
