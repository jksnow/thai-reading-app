import React from "react";
import {
  isPunctuation,
  isCharacterName,
  cleanCharacterName,
} from "../../utils/storyUtils";

interface ThaiWordRendererProps {
  text: string;
  showWordSpacing: boolean;
  onWordClick: (word: string, event: React.MouseEvent) => void;
}

const ThaiWordRenderer: React.FC<ThaiWordRendererProps> = ({
  text,
  showWordSpacing,
  onWordClick,
}) => {
  // Split text by spaces (Thai words are already space-separated)
  const words = text.split(" ").filter((word) => word.trim() !== "");

  return (
    <div className="thai-text">
      {words.map((word, index) => {
        // Check if this is a character name
        const isName = isCharacterName(word);

        // Clean character names by removing the [name] prefix
        const cleanedWord = isName ? cleanCharacterName(word) : word;

        // Clean word of punctuation for display but keep it for rendering
        const displayWord = isName
          ? "character_name" // Special handling for character names
          : cleanedWord.replace(/[.,?!;:]/g, "");

        // Skip rendering standalone punctuation when spacing is off
        if (!showWordSpacing && isPunctuation(cleanedWord)) {
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
            {cleanedWord}
          </span>
        );
      })}
    </div>
  );
};

export default ThaiWordRenderer;
