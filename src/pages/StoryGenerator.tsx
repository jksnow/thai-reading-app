import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStoryGeneration } from "../hooks/useStoryGeneration";
import { getFontSizeClass, StoryParams } from "../utils/storyUtils";
import { StoryControls, StoryDisplay } from "../components/story";
import TranslationPopup from "../components/TranslationPopup";
import StoryLoadingScreen from "../components/StoryLoadingScreen";
import { useAppState } from "../context/AppStateContext";
import GlobalButtonContainer from "../components/GlobalButtonContainer";

const StoryGenerator: React.FC = () => {
  // Access the app state context for selected modifiers, generation status and navigation
  const { selectedModifiers, setIsGeneratingStory, setCurrentSection } =
    useAppState();

  // Use a ref to track previous generation state
  const prevIsGeneratingRef = useRef<boolean | null>(null);

  // State to control component visibility
  const [showControls, setShowControls] = useState(true);
  const [showStory, setShowStory] = useState(false);

  // Story generation parameters
  const [storyParams, setStoryParams] = useState<StoryParams>({
    genre: "Adventure",
    parentalRating: "G (Everyone)",
    readingLevel: "Age 9-10 (Basic vocabulary, simple sentences)",
    paragraphs: 3,
  });

  // Font size and word spacing state
  const [fontSize, setFontSize] = useState<string>("medium");
  const [showWordSpacing, setShowWordSpacing] = useState<boolean>(true);

  // Translation popup state
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Get story generation functionality from custom hook
  const {
    isGenerating,
    storyHistory,
    currentStoryIndex,
    showChoices,
    generateInitialStory,
    handleShowChoices,
    handleChoiceSelect,
    resetStory,
  } = useStoryGeneration();

  // Redirect to modifier selection if no modifiers are selected
  useEffect(() => {
    if (selectedModifiers.length === 0) {
      setCurrentSection("modifier-selection");
    }
  }, [selectedModifiers, setCurrentSection]);

  // Update app state only when isGenerating actually changes
  useEffect(() => {
    if (prevIsGeneratingRef.current !== isGenerating) {
      setIsGeneratingStory(isGenerating);
      prevIsGeneratingRef.current = isGenerating;
    }
  }, [isGenerating, setIsGeneratingStory]);

  // Initialize component state on mount
  useEffect(() => {
    // Reset all state on component mount
    setShowControls(true);
    setShowStory(false);
    setIsGeneratingStory(false);
    prevIsGeneratingRef.current = false;

    return () => {
      // Clean up on unmount
      setIsGeneratingStory(false);
    };
  }, [setIsGeneratingStory]);

  // Handle story parameter changes
  const handleParamsChange = (params: Partial<StoryParams>) => {
    setStoryParams({ ...storyParams, ...params });
  };

  // Handle word click for translation
  const handleWordClick = (word: string, event: React.MouseEvent) => {
    setSelectedWord(word);
    setPopupPosition({ x: event.clientX, y: event.clientY });
  };

  // Close translation popup
  const closeTranslationPopup = () => {
    setSelectedWord(null);
  };

  // Toggle word spacing
  const toggleWordSpacing = () => {
    setShowWordSpacing(!showWordSpacing);
  };

  // Generate the story with current parameters and selected modifiers
  const handleGenerateStory = () => {
    // Fade out the controls
    setShowControls(false);

    // Wait a bit before starting generation to let fade complete
    setTimeout(() => {
      generateInitialStory(storyParams, selectedModifiers);
    }, 300);
  };

  // Handle loading completion
  const handleLoadingComplete = () => {
    setShowStory(true);
  };

  // Reset everything when starting a new story
  const handleResetStory = () => {
    // First hide the story display
    setShowStory(false);

    // Then wait for animations to complete before resetting story state
    setTimeout(() => {
      resetStory();
      // Finally, show controls after state is reset
      setTimeout(() => {
        setShowControls(true);
      }, 100);
    }, 300);
  };

  // Decide what to display based on state
  const renderContent = () => {
    // Show loading screen when generating and not showing story yet
    if (isGenerating) {
      return (
        <StoryLoadingScreen
          isVisible={true}
          onComplete={() => {
            if (!isGenerating && storyHistory.length > 0) {
              setShowStory(true);
            }
          }}
        />
      );
    }

    // Show the loading screen after generation is complete but story isn't visible yet
    if (storyHistory.length > 0 && !showStory && !isGenerating) {
      return (
        <StoryLoadingScreen
          isVisible={true}
          onComplete={() => setShowStory(true)}
        />
      );
    }

    // Show story controls when no story or story is reset
    if (storyHistory.length === 0) {
      return (
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <StoryControls
                params={storyParams}
                onParamsChange={handleParamsChange}
                onGenerateStory={handleGenerateStory}
                isGenerating={isGenerating}
              />
            </motion.div>
          )}
        </AnimatePresence>
      );
    }

    // If we have a story and we're ready to show it
    return (
      <AnimatePresence>
        {showStory && storyHistory.length > 0 && (
          <motion.div
            key="story-display"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
          >
            <StoryDisplay
              storyHistory={storyHistory}
              currentStoryIndex={currentStoryIndex}
              showChoices={showChoices}
              isGenerating={isGenerating}
              fontSizeClass={getFontSizeClass(fontSize)}
              showWordSpacing={showWordSpacing}
              onWordClick={handleWordClick}
              onShowChoices={handleShowChoices}
              onChoiceSelect={handleChoiceSelect}
              onResetStory={handleResetStory}
              onToggleWordSpacing={toggleWordSpacing}
              onFontSizeChange={setFontSize}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="w-full max-w-4xl">
        {renderContent()}

        {selectedWord && (
          <TranslationPopup
            word={selectedWord}
            position={popupPosition}
            onClose={closeTranslationPopup}
          />
        )}
      </div>

      <GlobalButtonContainer />
    </div>
  );
};

export default StoryGenerator;
