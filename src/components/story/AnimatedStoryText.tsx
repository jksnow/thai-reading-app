import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedStoryTextProps {
  text: string;
  showWordSpacing: boolean;
  fontSizeClass: string;
  onWordClick?: (word: string, event: React.MouseEvent) => void;
}

const AnimatedStoryText: React.FC<AnimatedStoryTextProps> = ({
  text,
  showWordSpacing,
  fontSizeClass,
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

  // Helper function to identify and mark Thai names
  const processWord = (word: string) => {
    // Check if this is a Thai name (marked with [name] prefix)
    if (word.startsWith("[name]")) {
      const nameText = word.replace("[name]", "");
      return (
        <span className="text-black font-normal thai-character-name">
          {nameText}
        </span>
      );
    }
    return word;
  };

  const handleWordClick = (word: string, e: React.MouseEvent) => {
    if (!onWordClick) return;

    // If word is a name (starts with [name]), provide "character_name" instead
    if (word.startsWith("[name]")) {
      onWordClick("character_name", e);
    } else {
      onWordClick(word.replace("[name]", ""), e);
    }
  };

  return (
    <motion.div
      className={`${fontSizeClass} leading-relaxed text-black mx-auto font-normal`}
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
