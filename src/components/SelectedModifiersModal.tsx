import { useState, useEffect } from "react";
import { useAppState } from "../context/AppStateContext";
import storyModifiers, { ModifierCategory } from "../data/storyModifiers";
import ButtonOptions from "./ButtonOptions";
import ButtonContainer from "./ButtonContainer";
import ModalContainer from "./ModalContainer";

// Category color mapping
const categoryColorMap: Record<ModifierCategory, string> = {
  [ModifierCategory.Character]: "border-blue-400 text-blue-200",
  [ModifierCategory.Setting]: "border-green-400 text-green-200",
  [ModifierCategory.Plot]: "border-purple-400 text-purple-200",
  [ModifierCategory.Tone]: "border-amber-400 text-amber-200",
  [ModifierCategory.Perspective]: "border-cyan-400 text-cyan-200",
  [ModifierCategory.NarrativeStyle]: "border-fuchsia-400 text-fuchsia-200",
};

// Get category color with fallback
const getCategoryColor = (category: string) => {
  return (
    categoryColorMap[category as ModifierCategory] ||
    "border-indigo-400 text-indigo-200"
  );
};

const SelectedModifiersModal = () => {
  const { selectedModifiers } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle visibility when modifiers change
  useEffect(() => {
    setIsVisible(selectedModifiers.length > 0);
  }, [selectedModifiers]);

  // Don't render anything if no modifiers selected
  if (!isVisible) {
    return null;
  }

  // Get the actual modifier objects based on their IDs
  const selectedModifierObjects = selectedModifiers
    .map((id: string) => storyModifiers.find((mod) => mod.id === id))
    .filter(Boolean);

  return (
    <>
      {/* Trigger button positioned at top left */}
      <div className="fixed top-8 left-8 z-40">
        <ButtonContainer>
          <ButtonOptions
            onClick={() => setIsOpen(true)}
            variant="purple"
          >
            STORY MODIFIERS
          </ButtonOptions>
        </ButtonContainer>
      </div>

      {/* Modal using ModalContainer */}
      <ModalContainer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="small"
      >
        <div className="text-white">
          {/* Modal header */}
          <div className="px-4 py-3 border-b border-gray-600">
            <h3 className="text-white text-lg font-medium text-center">
              Selected Modifiers
            </h3>
          </div>

          {/* Modal body */}
          <div className="px-4 py-4">
            <div className="space-y-3">
              {selectedModifierObjects.map((modifier: any, index: number) => (
                <div
                  key={modifier?.id}
                  className="p-0.5 rounded-lg bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-pink-500/50"
                >
                  <div className="bg-gray-900 rounded-md p-3 h-full">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(
                          modifier?.category || ""
                        )}`}
                      >
                        {modifier?.category}
                      </div>
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/30 text-xs font-semibold text-white">
                        {index + 1}
                      </div>
                    </div>
                    <h4 className="text-white font-semibold mb-1">
                      {modifier?.modifier}
                    </h4>
                    <p className="text-xs text-gray-300 font-light">
                      {modifier?.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModalContainer>
    </>
  );
};

export default SelectedModifiersModal;
