import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStoryGeneration } from "../hooks/useStoryGeneration";
import {
  getFontSizeClass,
  StoryParams,
  parseStoryResponse,
} from "../utils/storyUtils";
import { StoryControls, StoryDisplay } from "../components/story";
import StoryLoadingScreen from "../components/StoryLoadingScreen";
import { useAppState } from "../context/AppStateContext";
import GlobalButtonContainer from "../components/GlobalButtonContainer";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { CURRENT_PROMPT_VERSION } from "../types/user";

const StoryGenerator: React.FC = () => {
  // Access the app state context for selected modifiers, generation status and navigation
  const { selectedModifiers, setIsGeneratingStory, setCurrentSection } =
    useAppState();
  const { currentUser } = useAuth();

  // Use a ref to track previous generation state
  const prevIsGeneratingRef = useRef<boolean | null>(null);

  // State to control component visibility
  const [showControls, setShowControls] = useState(true);
  const [showStory, setShowStory] = useState(false);
  const [isLoadingSavedStory, setIsLoadingSavedStory] = useState(true);

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
    setStoryHistory,
    setCurrentStoryIndex,
  } = useStoryGeneration(storyParams);

  // Load saved story if exists
  useEffect(() => {
    const loadSavedStory = async () => {
      if (!currentUser) {
        setIsLoadingSavedStory(false);
        return;
      }

      try {
        const userData = await userService.getUserById(currentUser.uid);
        const currentStory = userData?.currentStory;

        if (!currentStory) {
          setIsLoadingSavedStory(false);
          return;
        }

        // Check if story is using an outdated prompt version
        if (currentStory.promptVersion !== CURRENT_PROMPT_VERSION) {
          console.log("Story using outdated prompt version, resetting...");
          await resetStory();
          setIsLoadingSavedStory(false);
          return;
        }

        // Handle story with modifiers but no response (incomplete story)
        if (currentStory.selectedModifiers && !currentStory.latestResponse) {
          setShowControls(true);
          setIsLoadingSavedStory(false);
          return;
        }

        // Load complete story - parse the raw response just like we do with API responses
        if (currentStory.latestResponse) {
          try {
            const parsedStory = parseStoryResponse(currentStory.latestResponse);
            if (parsedStory && parsedStory.text) {
              setStoryHistory([parsedStory]);
              setCurrentStoryIndex(0);
              setShowStory(true);
              setShowControls(false);
            } else {
              console.error("Invalid story format");
              await resetStory();
            }
          } catch (parseError) {
            console.error("Error parsing saved story:", parseError);
            await resetStory();
          }
        }
      } catch (error) {
        console.error("Error loading saved story:", error);
      }

      setIsLoadingSavedStory(false);
    };

    loadSavedStory();
  }, [currentUser]);

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

  // Handle story parameter changes
  const handleParamsChange = (params: Partial<StoryParams>) => {
    setStoryParams({ ...storyParams, ...params });
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

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {showControls && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StoryControls
                params={storyParams}
                onParamsChange={handleParamsChange}
                onGenerateStory={handleGenerateStory}
                isGenerating={isGenerating}
              />
            </motion.div>
          )}

          {!showControls && !isLoadingSavedStory && storyHistory.length > 0 && (
            <motion.div
              key="story-display"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <StoryDisplay
                storyHistory={storyHistory}
                currentStoryIndex={currentStoryIndex}
                showChoices={showChoices}
                isGenerating={isGenerating}
                fontSizeClass={getFontSizeClass(fontSize)}
                showWordSpacing={showWordSpacing}
                onShowChoices={handleShowChoices}
                onChoiceSelect={handleChoiceSelect}
                onResetStory={resetStory}
                onToggleWordSpacing={toggleWordSpacing}
                onFontSizeChange={setFontSize}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <GlobalButtonContainer />

        <StoryLoadingScreen
          isVisible={isGenerating}
          onComplete={() => setShowStory(true)}
        />
      </div>
    </div>
  );
};

export default StoryGenerator;
