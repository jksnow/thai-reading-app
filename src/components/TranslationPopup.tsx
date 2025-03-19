import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Meaning {
  meaning: string;
  partOfSpeech: string;
  displayOrder: number;
}

interface Translation {
  t2e: string;
  word: string;
  meanings: Meaning[];
  transliteration?: string;
}

interface TranslationPopupProps {
  translation?: Translation;
  onClose: () => void;
  position: { x: number; y: number };
  isLoading: boolean;
}

const TranslationPopup: React.FC<TranslationPopupProps> = ({
  translation,
  onClose,
  position,
  isLoading,
}) => {
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({
    position: "fixed",
    top: position.y,
    left: position.x,
    maxWidth: "300px",
    maxHeight: "400px",
    zIndex: 1000,
  });

  useEffect(() => {
    const updatePosition = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const popupWidth = 300; // max-width from style
      const popupHeight = 400; // max-height from style

      let left = position.x;
      let top = position.y;

      // Adjust horizontal position if popup would go off screen
      if (left + popupWidth > viewportWidth) {
        left = viewportWidth - popupWidth - 10;
      }

      // Adjust vertical position if popup would go off screen
      if (top + popupHeight > viewportHeight) {
        top = viewportHeight - popupHeight - 10;
      }

      setPopupStyle((prev) => ({
        ...prev,
        top,
        left,
      }));
    };

    updatePosition();
  }, [position]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.5,
      }}
      className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 overflow-auto"
      style={popupStyle}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3 border-b pb-2">
        <div>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-6 w-24 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 w-16 bg-gray-100 rounded"></div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-800">
                {translation?.word}
              </h3>
              <p className="text-sm text-gray-500">{translation?.t2e}</p>
              {translation?.transliteration && (
                <p className="text-xs text-gray-400 italic">
                  /{translation.transliteration}/
                </p>
              )}
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Meanings */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-full bg-gray-100 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
          </div>
        ) : (
          translation?.meanings
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((meaning, index) => (
              <div
                key={index}
                className="text-gray-700"
              >
                <span className="text-xs text-gray-500 font-medium">
                  {meaning.partOfSpeech}
                </span>
                <p className="text-sm">{meaning.meaning}</p>
              </div>
            ))
        )}
      </div>
    </motion.div>
  );
};

export default TranslationPopup;
