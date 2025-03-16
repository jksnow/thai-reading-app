import React from "react";
import { isPunctuation } from "../../utils/storyUtils";

interface ThaiWordRendererProps {
  text: string;
  showWordSpacing: boolean;
  characterNames: string[];
  onWordClick: (word: string, event: React.MouseEvent) => void;
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

        // Common props for both rendering modes
        const commonProps = {
          key: index,
          onClick: (e: React.MouseEvent) => onWordClick(displayWord, e),
        };

        // Apply different styling based on spacing mode
        const className = showWordSpacing
          ? "inline-block cursor-pointer hover:bg-parchment transition-colors duration-100 rounded px-0.5 mx-0.5"
          : "cursor-pointer hover:bg-parchment transition-colors duration-100 rounded";

        // Character names get a special styling
        const nameClassName = isName
          ? "font-bold text-accent-tertiary special-text"
          : "";

        return (
          <span
            {...commonProps}
            className={`${className} ${nameClassName}`}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export default ThaiWordRenderer;
