import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { getTransliteration } from "../api/thai2englishService";

interface Meaning {
  meaning: string;
  partOfSpeech: string;
  displayOrder: number;
}

interface Translation {
  t2e: string;
  word: string;
  meanings: Meaning[];
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
  const [transliteration, setTransliteration] = useState<string | null>(null);
  const [isTransliterationLoading, setIsTransliterationLoading] =
    useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({
    position: "fixed",
    top: position.y,
    left: position.x,
    maxWidth: "300px",
    maxHeight: "400px",
    zIndex: 1000,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (translation?.word) {
      setIsTransliterationLoading(true);
      const result = getTransliteration(translation.word);
      setTransliteration(result);
      setIsTransliterationLoading(false);
    } else {
      setTransliteration(null);
    }
  }, [translation?.word]);

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
      ref={popupRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className="bg-gray-900 shadow-2xl rounded-lg p-4 border border-gray-800 overflow-auto"
      style={popupStyle}
    >
      <div>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 w-24 bg-gray-800 rounded mb-1"></div>
            <div className="h-4 w-16 bg-gray-800 rounded"></div>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-medium text-white mb-1">
              {translation?.word}
            </h3>
            <p className="text-sm text-gray-400">{translation?.t2e}</p>
            {isTransliterationLoading ? (
              <div className="animate-pulse">
                <div className="h-3 w-20 bg-gray-800 rounded"></div>
              </div>
            ) : transliteration ? (
              <p className="text-xs text-gray-500 italic mb-2">
                /{transliteration}/
              </p>
            ) : null}
          </>
        )}
      </div>

      <div className="space-y-2 mt-2">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 w-full bg-gray-800 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-800 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-800 rounded"></div>
          </div>
        ) : (
          translation?.meanings
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((meaning, index) => (
              <div
                key={index}
                className="text-gray-300"
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
