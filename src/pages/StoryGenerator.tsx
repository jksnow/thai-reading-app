import React, { useState } from "react";
import { useStoryGeneration } from "../hooks/useStoryGeneration";
import { getFontSizeClass, StoryParams } from "../utils/storyUtils";
import { StoryControls, StoryDisplay } from "../components/story";
import TranslationPopup from "../components/TranslationPopup";

const StoryGenerator: React.FC = () => {
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

  // Generate the story with current parameters
  const handleGenerateStory = () => {
    generateInitialStory(storyParams);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {storyHistory.length === 0 ? (
        // Show story controls if no story has been generated yet
        <StoryControls
          params={storyParams}
          onParamsChange={handleParamsChange}
          onGenerateStory={handleGenerateStory}
          isGenerating={isGenerating}
        />
      ) : (
        // Show story display if a story has been generated
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
          onResetStory={resetStory}
          onToggleWordSpacing={toggleWordSpacing}
          onFontSizeChange={setFontSize}
        />
      )}

      {selectedWord && (
        <TranslationPopup
          word={selectedWord}
          position={popupPosition}
          onClose={closeTranslationPopup}
        />
      )}
    </div>
  );
};

export default StoryGenerator;
