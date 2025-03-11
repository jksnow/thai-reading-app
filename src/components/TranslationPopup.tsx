import React, { useState, useEffect, useRef } from "react";
import {
  translateThaiWord,
  TranslationResult,
  abbreviationFilter,
} from "../api/dictionaryService";
import ShaderButton from "./ShaderButton";

// example response
// {
//   "success": true,
//   "word": "ราย",
//   "translations": [
//     {
//       "search": "ราย",
//       "result": "case",
//       "type": "CLAS",
//       "define": "ลักษณนามใช้แก่สิ่งที่มีลักษณะเป็นเรื่อง ส่วน บุคคล หรือสิ่งซึ่งแยกกล่าวเป็นอย่างๆ ไป",
//       "relate": [
//         "instance",
//         "person",
//         "item",
//         "account",
//         "issue",
//         "story",
//         "party",
//         "statement",
//         "record"
//       ],
//       "sample": "ในปีถัดมามีข่าวการแท้งลูกในหญิง 7 ราย ในสหรัฐฯ และแคนาดา ซึ่งต้องนั่งทำงานอยู่หน้าจอภาพเป็นเวลานานๆ"
//     },
//     {
//       "search": "ราย",
//       "result": "case",
//       "type": "N",
//       "define": "เรื่อง ส่วน บุคคล หรือสิ่งซึ่งแยกกล่าวเป็นอย่างๆ ไป",
//       "relate": [
//         "instance",
//         "person",
//         "item",
//         "account",
//         "issue",
//         "story",
//         "party",
//         "statement",
//         "record"
//       ],
//       "sample": "ถ้าคุณได้พบกับคนไข้อีกรายหนึ่งที่มีอาการคล้ายคลึงกับคุณ คุณจะรู้สึกดีขึ้น"
//     }
//   ]
// }

interface TranslationPopupProps {
  word: string;
  onClose: () => void;
  position: { x: number; y: number };
}

const TranslationPopup = ({
  word,
  onClose,
  position,
}: TranslationPopupProps) => {
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Fetch translation when component mounts
  useEffect(() => {
    const fetchTranslation = async () => {
      try {
        setLoading(true);
        const results = await translateThaiWord(word);
        setTranslations(results);
        setError(null);
      } catch (err) {
        setError("Failed to translate word");
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
      maxHeight: "80vh", // Limit maximum height
    };

    // We need to wait for the component to mount to get its dimensions
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate horizontal position (centered by default)
      let left = position.x - rect.width / 2;

      // Ensure popup doesn't go off the left edge
      if (left < 20) {
        left = 20;
      }

      // Ensure popup doesn't go off the right edge
      if (left + rect.width > viewportWidth - 20) {
        left = viewportWidth - rect.width - 20;
      }

      // Calculate vertical position
      let top = position.y + 20; // Default position below the cursor

      // Check if popup would go off the bottom of the screen
      if (top + rect.height > viewportHeight - 20) {
        // Try positioning above the cursor
        top = position.y - rect.height - 20;

        // If that would put it off the top of the screen, center it vertically
        if (top < 20) {
          top = Math.max(20, (viewportHeight - rect.height) / 2);
        }
      }

      style.left = `${left}px`;
      style.top = `${top}px`;
    } else {
      // Initial position before first render
      style.left = `${position.x}px`;
      style.top = `${position.y + 20}px`;
    }

    return style;
  };

  // Force recalculation of position when content changes
  useEffect(() => {
    // Small delay to allow content to render first
    const timer = setTimeout(() => {
      // Force a re-render to recalculate position
      setLoading(loading);
    }, 100);

    return () => clearTimeout(timer);
  }, [translations]);

  return (
    <div
      ref={popupRef}
      className="fixed bg-white shadow-lg rounded-md p-4 z-50 max-w-md border border-gray-200"
      style={getPopupStyle()}
    >
      {/* Header with close button */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-2xl font-bold text-gray-800">{word}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Content area */}
      <div className="max-h-[60vh] overflow-y-auto pr-1">
        {loading ? (
          <div className="py-4 text-center">
            <div className="animate-pulse text-gray-500">
              Loading translation...
            </div>
          </div>
        ) : error ? (
          <div className="py-4 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : translations.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-gray-500">No translation found for "{word}"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {translations.map((translation, index) => (
              <div
                key={index}
                className="border-b border-gray-100 pb-4 last:border-b-0"
              >
                {/* Translation result and type */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-semibold text-gray-800">
                      {translation.result}
                    </span>
                    {translation.type && (
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {abbreviationFilter(translation.type)}
                      </span>
                    )}
                  </div>

                  {/* Search term */}
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Thai:</span>{" "}
                    {translation.search}
                  </div>
                </div>

                {/* Definition */}
                {translation.define && translation.define.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      Definition:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 pl-1 space-y-1">
                      {Array.isArray(translation.define) ? (
                        translation.define.map((def, i) => (
                          <li key={i}>{def}</li>
                        ))
                      ) : (
                        <li>{translation.define}</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Sample usage */}
                {translation.sample && (
                  <div className="mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      Example:
                    </h4>
                    <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded">
                      {translation.sample}
                    </p>
                  </div>
                )}

                {/* Synonyms */}
                {translation.synonym && translation.synonym.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      Synonyms:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {translation.synonym.map((syn, i) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Antonyms */}
                {translation.antonym && translation.antonym.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      Antonyms:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {translation.antonym.map((ant, i) => (
                        <span
                          key={i}
                          className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded"
                        >
                          {ant}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related words */}
                {translation.relate && translation.relate.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      Related:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {translation.relate.map((rel, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                        >
                          {rel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Classifiers */}
                {translation.classifier &&
                  translation.classifier.length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Classifiers:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {translation.classifier.map((cls, i) => (
                          <span
                            key={i}
                            className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Tags */}
                {translation.tag && translation.tag.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      Tags:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {translation.tag.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pointer arrow */}
      <div className="absolute w-3 h-3 bg-white transform rotate-45 left-1/2 -ml-1.5 -bottom-1.5 border-r border-b border-gray-200"></div>
    </div>
  );
};

export default TranslationPopup;
