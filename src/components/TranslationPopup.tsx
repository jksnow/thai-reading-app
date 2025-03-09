import React, { useState, useEffect, useRef } from "react";
import translationService from "../api/translationService";
import ShaderButton from "./ShaderButton";

interface TranslationPopupProps {
  word: string;
  onClose: () => void;
  position: { x: number; y: number };
}

const TranslationPopup: React.FC<TranslationPopupProps> = ({
  word,
  onClose,
  position,
}) => {
  const [translation, setTranslation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTranslation = async () => {
      try {
        setLoading(true);
        const result = await translationService.translateText(word);
        setTranslation(result);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to translate word");
        console.error("Translation error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslation();
  }, [word]);

  // Close popup when clicking outside
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Calculate position to ensure popup stays within viewport
  const getPopupStyle = () => {
    const style: React.CSSProperties = {
      position: "fixed",
      zIndex: 50,
    };

    // Default positions
    style.left = `${position.x}px`;
    style.top = `${position.y + 20}px`;

    // Adjust if needed after component mounts
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Check right edge
      if (position.x + rect.width > viewportWidth) {
        style.left = `${viewportWidth - rect.width - 10}px`;
      }

      // Check bottom edge
      if (position.y + 20 + rect.height > viewportHeight) {
        style.top = `${position.y - rect.height - 10}px`;
      }
    }

    return style;
  };

  return (
    <div
      ref={popupRef}
      className="adventure-container p-4 shadow-lg w-64 animate-fadeIn"
      style={getPopupStyle()}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-lg">Translation</h3>
        <button
          onClick={onClose}
          className="text-ink/60 hover:text-ink p-1 rounded-full"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
            ></line>
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
            ></line>
          </svg>
        </button>
      </div>

      <div className="mb-2 p-2 bg-parchment rounded text-center font-medium">
        {word}
      </div>

      <div className="border-t border-parchment-dark pt-2">
        {loading ? (
          <div className="text-center py-2 text-ink/70">Translating...</div>
        ) : error ? (
          <div className="text-center py-2 text-danger text-sm">{error}</div>
        ) : (
          <div className="py-1 text-ink">{translation}</div>
        )}
      </div>
    </div>
  );
};

export default TranslationPopup;
