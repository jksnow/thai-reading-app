import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Choice, StorySegment } from "../../utils/storyUtils";
import AnimatedStoryText from "./AnimatedStoryText";
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
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);

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

  const handleSubmitChoice = () => {
    if (selectedChoice && !isGenerating) {
      onChoiceSelect(selectedChoice);
      setSelectedChoice(null);
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

      {!currentStory.isEnding && (
        <motion.div
          className="choices mb-6"
          variants={buttonVariants}
        >
          {showChoices ? (
            <>
              <h2 className="text-lg font-semibold mb-2">Choose your path:</h2>
              <div className="space-y-3">
                {currentStory.choices.map((choice, index) => (
                  <motion.div
                    key={choice.id}
                    onClick={() => !isGenerating && setSelectedChoice(choice)}
                    className={`flex items-center p-4 rounded-lg transition-all duration-300 shadow-sm cursor-pointer
                      ${
                        selectedChoice?.id === choice.id
                          ? "bg-amber-100 border-2 border-amber-500 shadow-amber-200/50"
                          : "bg-white hover:bg-amber-50 border border-amber-200"
                      }
                    `}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        id={`choice-${choice.id}`}
                        name="story-choice"
                        className="peer sr-only"
                        checked={selectedChoice?.id === choice.id}
                        onChange={() => setSelectedChoice(choice)}
                        disabled={isGenerating}
                      />
                      <div
                        className={`w-5 h-5 border-2 rounded-full mr-4 flex items-center justify-center
                        ${
                          selectedChoice?.id === choice.id
                            ? "border-amber-500 bg-amber-500"
                            : "border-gray-300 bg-white"
                        }
                      `}
                      >
                        {selectedChoice?.id === choice.id && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <AnimatedStoryText
                        text={`${index + 1}. ${choice.text}`}
                        fontSizeClass={fontSizeClass}
                        showWordSpacing={showWordSpacing}
                        characterNames={currentStory.characterNames || []}
                        onWordClick={(word, event) => {
                          // Stop the click from triggering the choice selection
                          event.stopPropagation();
                          handleWordClick(word, event);
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <ButtonOptions
                  onClick={handleSubmitChoice}
                  variant="amber"
                  padding="py-3 px-10"
                  disabled={!selectedChoice || isGenerating}
                >
                  {isGenerating ? "Processing..." : "Submit Choice"}
                </ButtonOptions>
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
        <div className="p-4 text-white max-h-[80vh] flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-center">
            English Summary
          </h2>
          <div className="overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-track-white/10 scrollbar-thumb-white/30 hover:scrollbar-thumb-white/40 scrollbar-track-rounded-lg scrollbar-thumb-rounded-lg">
            <p className="text-lg leading-relaxed">{currentStory.summary}</p>
          </div>
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
