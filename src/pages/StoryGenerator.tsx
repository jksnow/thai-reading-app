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
  } = useStoryGeneration();

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

        // Load complete story
        if (currentStory.latestResponse) {
          const parsedStory = parseStoryResponse(currentStory.latestResponse);
          setStoryHistory([parsedStory]);
          setCurrentStoryIndex(0);
          setShowStory(true);
          setShowControls(false);
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

  // Save story response to MongoDB
  useEffect(() => {
    const saveStoryResponse = async () => {
      if (!currentUser || storyHistory.length === 0) return;

      try {
        const currentStorySegment = storyHistory[currentStoryIndex];
        await userService.updateUser(currentUser.uid, {
          currentStory: {
            selectedModifiers,
            latestResponse: JSON.stringify(currentStorySegment),
            promptVersion: 1,
          },
        });
      } catch (error) {
        console.error("Error saving story response:", error);
      }
    };

    if (!isGenerating && storyHistory.length > 0) {
      saveStoryResponse();
    }
  }, [
    currentUser,
    storyHistory,
    currentStoryIndex,
    isGenerating,
    selectedModifiers,
  ]);

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
    if (isLoadingSavedStory) {
      return (
        <StoryLoadingScreen
          isVisible={true}
          onComplete={() => {}}
        />
      );
    }

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
      <div className="w-full max-w-4xl">{renderContent()}</div>

      <GlobalButtonContainer />
    </div>
  );
};

export default StoryGenerator;
