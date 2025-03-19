import React, { useState, useEffect } from "react";
import ButtonOptions from "./ButtonOptions";
import { useAppState } from "../context/AppStateContext";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { CURRENT_PROMPT_VERSION } from "../types/user";

interface StartModalContentProps {
  onClose: () => void;
}

const StartModalContent: React.FC<StartModalContentProps> = ({ onClose }) => {
  const { setCurrentSection, setSelectedModifiers } = useAppState();
  const { currentUser } = useAuth();
  const [hasCurrentStory, setHasCurrentStory] = useState<boolean>(false);
  const [isOutdatedVersion, setIsOutdatedVersion] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isIncompleteStory, setIsIncompleteStory] = useState<boolean>(false);

  // Check for existing story on mount
  useEffect(() => {
    const checkCurrentStory = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await userService.getUserById(currentUser.uid);
        const currentStory = userData?.currentStory;

        if (currentStory) {
          setHasCurrentStory(true);
          setIsOutdatedVersion(
            currentStory.promptVersion !== CURRENT_PROMPT_VERSION
          );

          // Check if story is incomplete (has modifiers but no response)
          setIsIncompleteStory(
            !!currentStory.selectedModifiers && !currentStory.latestResponse
          );
        }
      } catch (error) {
        console.error("Error checking current story:", error);
      }

      setIsLoading(false);
    };

    checkCurrentStory();
  }, [currentUser]);

  const handleNewStory = async () => {
    // Clear modifiers from app state
    setSelectedModifiers([]);

    // Clear currentStory in MongoDB if user is logged in
    if (currentUser) {
      try {
        await userService.updateUser(currentUser.uid, {
          currentStory: undefined,
        });
      } catch (error) {
        console.error("Error clearing story data:", error);
      }
    }

    // Navigate to modifier selection
    setCurrentSection("modifier-selection");
    onClose();
  };

  const handleContinueStory = async () => {
    if (!currentUser || !hasCurrentStory) return;

    try {
      const userData = await userService.getUserById(currentUser.uid);
      const currentStory = userData?.currentStory;

      if (!currentStory) return;

      // Check if we have both modifiers and response
      const hasModifiers =
        Array.isArray(currentStory.selectedModifiers) &&
        currentStory.selectedModifiers.length > 0;
      const hasResponse = !!currentStory.latestResponse;

      // Set the modifiers in app state if they exist
      if (hasModifiers) {
        setSelectedModifiers(currentStory.selectedModifiers);
      }

      // Navigate to appropriate section based on story state
      if (hasModifiers && hasResponse) {
        // If we have both modifiers and response, go directly to story display
        setCurrentSection("story-generator");
      } else {
        // If we're missing either, go to modifier selection
        setCurrentSection("modifier-selection");
      }

      onClose();
    } catch (error) {
      console.error("Error continuing story:", error);
    }
  };

  const getContinueButtonText = () => {
    if (isLoading) return "Loading...";
    if (isOutdatedVersion) return "Story from older version";
    if (isIncompleteStory) return "Continue Incomplete Story";
    return "Continue Story";
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Start Reading</h2>

      <div className="flex flex-col gap-4">
        <ButtonOptions
          onClick={handleNewStory}
          variant="blue"
          padding="py-2"
        >
          New Story
        </ButtonOptions>

        <ButtonOptions
          onClick={handleContinueStory}
          variant="blue"
          padding="py-2"
          disabled={isLoading || !hasCurrentStory || isOutdatedVersion}
        >
          {getContinueButtonText()}
        </ButtonOptions>

        {isOutdatedVersion && (
          <p className="text-sm text-yellow-400 text-center">
            This story was created with an older version of the app. Please
            start a new story.
          </p>
        )}

        {isIncompleteStory && (
          <p className="text-sm text-blue-400 text-center">
            You have an unfinished story. Continue to complete it!
          </p>
        )}
      </div>
    </div>
  );
};

export default StartModalContent;
