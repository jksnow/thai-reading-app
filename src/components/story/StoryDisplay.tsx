import React from "react";
import { motion } from "framer-motion";
import { Choice, StorySegment } from "../../utils/storyUtils";
import ThaiWordRenderer from "./ThaiWordRenderer";
import AnimatedStoryText from "./AnimatedStoryText";
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

  // Animation variants for the container
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 100,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        when: "beforeChildren",
      },
    },
  };

  // Animation variants for buttons
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.8, duration: 0.3 },
    },
  };

  return (
    <motion.div
      className="adventure-container p-8 shadow-lg max-w-4xl w-full rounded-xl bg-white border border-gray-200"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex justify-between items-center mb-4">
        <motion.h1
          className="text-xl font-bold text-black font-serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your Adventure
        </motion.h1>
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => onFontSizeChange("small")}
            className={`px-2 py-1 rounded ${
              fontSizeClass.includes("text-3xl") &&
              !fontSizeClass.includes("text-4xl") &&
              !fontSizeClass.includes("text-5xl")
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            A-
          </button>
          <button
            onClick={() => onFontSizeChange("medium")}
            className={`px-2 py-1 rounded ${
              fontSizeClass.includes("text-4xl")
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            A
          </button>
          <button
            onClick={() => onFontSizeChange("large")}
            className={`px-2 py-1 rounded ${
              fontSizeClass.includes("text-5xl")
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            A+
          </button>
        </motion.div>
      </div>

      <motion.div
        className="mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={onToggleWordSpacing}
          className={`px-3 py-2 rounded text-sm ${
            showWordSpacing
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {showWordSpacing ? "Spaced Words" : "Connected Words"}
        </button>
      </motion.div>

      <div className="story-text mb-6 text-black">
        <AnimatedStoryText
          text={currentStory.text}
          fontSizeClass={fontSizeClass}
          showWordSpacing={showWordSpacing}
          onWordClick={onWordClick}
        />
      </div>

      {currentStory.choices.length > 0 && !currentStory.isEnding && (
        <motion.div
          className="choices mb-6"
          variants={buttonVariants}
        >
          {showChoices ? (
            <>
              <h2 className="text-lg font-semibold mb-2 text-black">
                Choose your path:
              </h2>
              <div className="space-y-2">
                {currentStory.choices.map((choice, index) => (
                  <motion.button
                    key={choice.id}
                    onClick={() => onChoiceSelect(choice)}
                    disabled={isGenerating}
                    className="block w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-left rounded transition-colors duration-200 border border-gray-300 text-black"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    {choice.text}
                  </motion.button>
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
        </motion.div>
      )}

      {currentStory.isEnding && (
        <motion.div
          className="ending-message mb-6 text-center"
          variants={buttonVariants}
        >
          <p className="text-lg font-bold text-black mb-4">
            The End of Your Adventure
          </p>
          <ShaderButton
            onClick={onResetStory}
            className="px-4 py-2 rounded text-white"
          >
            Start a New Adventure
          </ShaderButton>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StoryDisplay;
