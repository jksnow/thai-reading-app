import React from "react";
import { isPunctuation } from "../../utils/storyUtils";

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
    <>
      {words.map((word, index) => {
        // Clean word of punctuation for display but keep it for rendering
        const displayWord = word.replace(/[.,?!;:]/g, "");

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

        return (
          <span
            {...commonProps}
            className={className}
          >
            {word}
          </span>
        );
      })}
    </>
  );
};

export default ThaiWordRenderer;
