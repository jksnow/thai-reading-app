import React, { useState } from "react";
import ModalContainer from "./ModalContainer";
import Carousel from "./Carousel";
import storyModifiers, { ModifierCategory } from "../data/storyModifiers";

interface ModifiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  isChildModal?: boolean;
}

// Category color mapping using the exact ModifierCategory enum values
const categoryStyleMap: Record<
  ModifierCategory,
  {
    background: string;
    border: string;
    categoryText: string;
    titleGradient: string;
    bodyText: string;
  }
> = {
  [ModifierCategory.Character]: {
    background: "from-blue-950 to-blue-900",
    border: "border-blue-400/30",
    categoryText: "text-blue-300",
    titleGradient: "from-white to-blue-200",
    bodyText: "text-blue-100",
  },
  [ModifierCategory.Setting]: {
    background: "from-green-950 to-green-900",
    border: "border-green-400/30",
    categoryText: "text-green-300",
    titleGradient: "from-white to-green-200",
    bodyText: "text-green-100",
  },
  [ModifierCategory.Plot]: {
    background: "from-purple-950 to-purple-900",
    border: "border-purple-400/30",
    categoryText: "text-purple-300",
    titleGradient: "from-white to-purple-200",
    bodyText: "text-purple-100",
  },
  [ModifierCategory.Tone]: {
    background: "from-amber-950 to-amber-900",
    border: "border-amber-400/30",
    categoryText: "text-amber-300",
    titleGradient: "from-white to-amber-200",
    bodyText: "text-amber-100",
  },
  [ModifierCategory.Perspective]: {
    background: "from-cyan-950 to-cyan-900",
    border: "border-cyan-400/30",
    categoryText: "text-cyan-300",
    titleGradient: "from-white to-cyan-200",
    bodyText: "text-cyan-100",
  },
  [ModifierCategory.NarrativeStyle]: {
    background: "from-fuchsia-950 to-fuchsia-900",
    border: "border-fuchsia-400/30",
    categoryText: "text-fuchsia-300",
    titleGradient: "from-white to-fuchsia-200",
    bodyText: "text-fuchsia-100",
  },
};

const ModifiersModal: React.FC<ModifiersModalProps> = ({
  isOpen,
  onClose,
  isChildModal = false,
}) => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  // Group modifiers by category
  const modifiersByCategory = Object.values(ModifierCategory).map(category => ({
    category,
    modifiers: storyModifiers.filter(mod => mod.category === category)
  }));

  const handlePrevious = () => {
    setCurrentCategoryIndex((prev) => 
      (prev - 1 + modifiersByCategory.length) % modifiersByCategory.length
    );
  };

  const handleNext = () => {
    setCurrentCategoryIndex((prev) => 
      (prev + 1) % modifiersByCategory.length
    );
  };

  const renderCategory = (item: typeof modifiersByCategory[0]) => {
    const styles = categoryStyleMap[item.category];

    return (
      <div className="p-4 max-h-[70vh] overflow-y-auto">
        <h3 className={`${styles.categoryText} text-xl font-bold mb-4 text-center uppercase tracking-widest`}>
          {item.category}
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {item.modifiers.map((modifier) => (
            <div
              key={modifier.id}
              className={`bg-gradient-to-br ${styles.background} rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 border ${styles.border}`}
              style={{
                aspectRatio: '2.5/3.5',
                minHeight: '90px'
              }}
            >
              <div className="p-2 flex flex-col h-full w-full relative">
                <div className={`text-center mb-1 pb-1 border-b ${styles.border}`}>
                  <h4 className={`text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r ${styles.titleGradient}`}>
                    {modifier.modifier}
                  </h4>
                </div>
                <p className={`${styles.bodyText} text-[10px] leading-tight text-center flex-grow`}>
                  {modifier.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      showOverlay={!isChildModal}
    >
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Modifiers Collection</h2>
        <Carousel
          items={modifiersByCategory}
          currentIndex={currentCategoryIndex}
          onPrevious={handlePrevious}
          onNext={handleNext}
          renderItem={renderCategory}
          variant="purple"
          containerClassName="bg-gray-900"
          containerStyle={{ minHeight: '500px' }}
        />
      </div>
    </ModalContainer>
  );
};

export default ModifiersModal; 