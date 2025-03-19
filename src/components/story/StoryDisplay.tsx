import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Choice, StorySegment } from "../../utils/storyUtils";
import ThaiWordRenderer from "./ThaiWordRenderer";
import AnimatedStoryText from "./AnimatedStoryText";
import ShaderButton from "../ShaderButton";
import ButtonOptions from "../ButtonOptions";
import CharacterNames from "./CharacterNames";
import ModalContainer from "../ModalContainer";
import { getTranslation } from "../../api/thai2englishService";
import type { Translation } from "../../api/thai2englishService";
import TranslationPopup from "../TranslationPopup";

interface StoryDisplayProps {
  storyHistory: StorySegment[];
  currentStoryIndex: number;
  showChoices: boolean;
  isGenerating: boolean;
  fontSizeClass: string;
  showWordSpacing: boolean;
  onShowChoices: () => void;
  onChoiceSelect: (choice: Choice) => void;
  onResetStory: () => void;
  onToggleWordSpacing: () => void;
  onFontSizeChange: (size: string) => void;
}

interface PopupState {
  translation?: Translation;
  position: { x: number; y: number };
  isLoading: boolean;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({
  storyHistory,
  currentStoryIndex,
  showChoices,
  isGenerating,
  fontSizeClass,
  showWordSpacing,
  onShowChoices,
  onChoiceSelect,
  onResetStory,
  onToggleWordSpacing,
  onFontSizeChange,
}) => {
  const currentStory = storyHistory[currentStoryIndex];
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedTranslation, setSelectedTranslation] =
    useState<PopupState | null>(null);
  const [showCharacters, setShowCharacters] = useState(false);

  // Guard against undefined story
  if (!currentStory) {
    return null;
  }

  const handleWordClick = async (word: string, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    // Clean quotes from word
    const cleanedWord = word.replace(/['"]/g, "");

    // Show loading state immediately
    setSelectedTranslation({
      position: {
        x: rect.left,
        y: rect.bottom,
      },
      isLoading: true,
    });

    // If it's a character name, show special modal
    if (currentStory.characterNames?.includes(cleanedWord)) {
      setSelectedTranslation({
        position: {
          x: rect.left,
          y: rect.bottom,
        },
        translation: {
          word: cleanedWord,
          t2e: "Character Name",
          meanings: [
            {
              meaning: "This is a character in the story",
              partOfSpeech: "name",
              displayOrder: 1,
            },
          ],
          dateAdded: new Date().toISOString(),
        },
        isLoading: false,
      });
      return;
    }

    // Fetch translation for non-character words
    const translation = await getTranslation(cleanedWord);
    if (translation) {
      setSelectedTranslation({
        position: {
          x: rect.left,
          y: rect.bottom,
        },
        translation,
        isLoading: false,
      });
    } else {
      // Create a fallback translation for potential names
      setSelectedTranslation({
        position: {
          x: rect.left,
          y: rect.bottom,
        },
        translation: {
          word: cleanedWord,
          t2e: "No translation found - this might be a name",
          meanings: [
            {
              meaning:
                "This word was not found in our dictionary. If this is a name, it does not need translation.",
              partOfSpeech: "unknown",
              displayOrder: 1,
            },
          ],
          dateAdded: new Date().toISOString(),
        },
        isLoading: false,
      });
    }
  };

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
      className="parchment-paper p-8 shadow-lg max-w-4xl w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex justify-between items-center mb-4">
        <motion.h1
          className="text-xl font-bold font-serif"
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
          <ButtonOptions
            onClick={() => setIsSummaryModalOpen(true)}
            variant="amber"
            padding="px-3 py-1"
          >
            English Summary
          </ButtonOptions>
          <button
            onClick={() => onFontSizeChange("small")}
            className={`px-2 py-1 rounded ${
              fontSizeClass.includes("text-3xl") &&
              !fontSizeClass.includes("text-4xl") &&
              !fontSizeClass.includes("text-5xl")
                ? "bg-amber-700 text-white"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            A-
          </button>
          <button
            onClick={() => onFontSizeChange("medium")}
            className={`px-2 py-1 rounded ${
              fontSizeClass.includes("text-4xl")
                ? "bg-amber-700 text-white"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            A
          </button>
          <button
            onClick={() => onFontSizeChange("large")}
            className={`px-2 py-1 rounded ${
              fontSizeClass.includes("text-5xl")
                ? "bg-amber-700 text-white"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            A+
          </button>
        </motion.div>
      </div>

      <motion.div
        className="mb-4 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={onToggleWordSpacing}
          className={`px-3 py-2 rounded text-sm ${
            showWordSpacing
              ? "bg-amber-700 text-white"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {showWordSpacing ? "Spaced Words" : "Connected Words"}
        </button>
        <button
          onClick={() => setShowCharacters(!showCharacters)}
          className={`px-3 py-2 rounded text-sm ${
            showCharacters
              ? "bg-amber-700 text-white"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {showCharacters ? "Hide Characters" : "Show Characters"}
        </button>
      </motion.div>

      {showCharacters &&
        currentStory.characterNames &&
        currentStory.characterNames.length > 0 && (
          <CharacterNames characterNames={currentStory.characterNames} />
        )}

      <div className="story-text mb-6">
        <AnimatedStoryText
          text={currentStory.text}
          fontSizeClass={fontSizeClass}
          showWordSpacing={showWordSpacing}
          characterNames={currentStory.characterNames || []}
          onWordClick={handleWordClick}
        />
      </div>

      {currentStory.choices.length > 0 && !currentStory.isEnding && (
        <motion.div
          className="choices mb-6"
          variants={buttonVariants}
        >
          {showChoices ? (
            <>
              <h2 className="text-lg font-semibold mb-2">Choose your path:</h2>
              <div className="space-y-2">
                {currentStory.choices.map((choice, index) => (
                  <motion.button
                    key={choice.id}
                    onClick={() => onChoiceSelect(choice)}
                    disabled={isGenerating}
                    className="block w-full px-4 py-2 bg-amber-50 hover:bg-amber-100 text-left rounded transition-colors duration-200 border border-amber-200"
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
              <ButtonOptions
                onClick={onShowChoices}
                variant="amber"
                padding="py-2 px-4"
              >
                What will you do next?
              </ButtonOptions>
            </div>
          )}
        </motion.div>
      )}

      {currentStory.isEnding && (
        <motion.div
          className="ending-message mb-6 text-center"
          variants={buttonVariants}
        >
          <p className="text-lg font-bold mb-4">The End of Your Adventure</p>
          <ButtonOptions
            onClick={onResetStory}
            variant="amber"
            padding="py-2 px-4"
          >
            Start a New Adventure
          </ButtonOptions>
        </motion.div>
      )}

      <ModalContainer
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        size="small"
      >
        <div className="p-4 text-white">
          <h2 className="text-2xl font-bold mb-4 text-center">
            English Summary
          </h2>
          <p className="text-lg leading-relaxed">{currentStory.summary}</p>
        </div>
      </ModalContainer>

      <AnimatePresence>
        {selectedTranslation && (
          <TranslationPopup
            translation={selectedTranslation.translation}
            position={selectedTranslation.position}
            isLoading={selectedTranslation.isLoading}
            onClose={() => setSelectedTranslation(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StoryDisplay;
