import React from "react";
import { isPunctuation } from "../../utils/storyUtils";

interface ThaiWordRendererProps {
  text: string;
  showWordSpacing: boolean;
  characterNames: string[];
  onWordClick?: (word: string, event: React.MouseEvent) => void;
}

const ThaiWordRenderer: React.FC<ThaiWordRendererProps> = ({
  text,
  showWordSpacing,
  characterNames,
  onWordClick,
}) => {
  // Split text by spaces (Thai words are already space-separated)
  const words = text.split(" ").filter((word) => word.trim() !== "");

  // Check if a word is a character name from the array
  const isCharacterName = (word: string): boolean => {
    return characterNames.some((name) => name === word);
  };

  return (
    <div className="thai-text">
      {words.map((word, index) => {
        // Check if this word is a character name
        const isName = isCharacterName(word);

        // Clean word of punctuation for display but keep it for rendering
        const displayWord = isName
          ? "character_name" // Special handling for character names
          : word.replace(/[.,?!;:]/g, "");

        // Skip rendering standalone punctuation when spacing is off
        if (!showWordSpacing && isPunctuation(word)) {
          return null;
        }

        return (
          <span
            key={index}
            className={`inline-block ${
              isName
                ? "text-amber-700 font-bold"
                : "text-black hover:text-blue-600 hover:underline cursor-pointer"
            }`}
            onClick={
              onWordClick
                ? (e: React.MouseEvent) => onWordClick(displayWord, e)
                : undefined
            }
          >
            {displayWord}
          </span>
        );
      })}
    </div>
  );
};

export default ThaiWordRenderer;
