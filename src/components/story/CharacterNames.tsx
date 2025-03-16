import React from "react";
import { motion } from "framer-motion";

interface CharacterNamesProps {
  characterNames: string[];
}

const CharacterNames: React.FC<CharacterNamesProps> = ({ characterNames }) => {
  if (!characterNames || characterNames.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="character-names bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <h3 className="text-sm font-medium text-amber-900 mb-2">
        Characters in this story:
      </h3>
      <div className="flex flex-wrap gap-2">
        {characterNames.map((name, index) => (
          <span
            key={index}
            className="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm font-medium"
          >
            {name}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default CharacterNames;
