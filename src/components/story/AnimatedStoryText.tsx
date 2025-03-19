import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedStoryTextProps {
  text: string;
  showWordSpacing: boolean;
  fontSizeClass: string;
  characterNames: string[];
  onWordClick?: (word: string, event: React.MouseEvent) => void;
}

const AnimatedStoryText: React.FC<AnimatedStoryTextProps> = ({
  text,
  showWordSpacing,
  fontSizeClass,
  characterNames,
  onWordClick,
}) => {
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    // Split the text into words for animation
    if (text) {
      setWords(text.split(" ").filter((word) => word.trim() !== ""));
    }
  }, [text]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.02, // Delay between each word
        delayChildren: 0.2, // Initial delay
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  // Helper function to check if a word is a character name
  const isCharacterName = (word: string): boolean => {
    return characterNames.some((name) => name === word);
  };

  // Helper function to process word for display
  const processWord = (word: string) => {
    // Check if this is a character name
    if (isCharacterName(word)) {
      return (
        <span className="text-black font-bold text-accent-tertiary special-text">
          {word}
        </span>
      );
    }
    return word;
  };

  const handleWordClick = (word: string, e: React.MouseEvent) => {
    if (!onWordClick) return;
    onWordClick(word, e);
  };

  return (
    <motion.div
      className={`${fontSizeClass} leading-relaxed text-black mx-auto font-normal thai-text`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className={`inline-block ${showWordSpacing ? "mr-2" : "mr-1"}`}
          variants={wordVariants}
          onClick={(e) => handleWordClick(word, e)}
          style={{
            cursor: onWordClick ? "pointer" : "default",
            display: "inline-block",
          }}
        >
          {processWord(word)}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default AnimatedStoryText;
