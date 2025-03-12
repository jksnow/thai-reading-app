import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import storyModifiers, { StoryModifier } from "../data/storyModifiers";
import ShaderButton from "../components/ShaderButton";

const StoryModifierSelection = () => {
  const navigate = useNavigate();
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [randomModifiers, setRandomModifiers] = useState<StoryModifier[]>([]);

  // Get 5 random modifiers on component mount
  useEffect(() => {
    const getRandomModifiers = () => {
      const shuffled = [...storyModifiers].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5);
    };
    setRandomModifiers(getRandomModifiers());
  }, []);

  const toggleModifier = (id: string) => {
    setSelectedModifiers((prev) => {
      // If already selected, remove it
      if (prev.includes(id)) {
        return prev.filter((modId) => modId !== id);
      }

      // If already have 3 selections, don't allow more
      if (prev.length >= 3) {
        return prev;
      }

      // Add new selection
      return [...prev, id];
    });
  };

  const isSelected = (id: string) => selectedModifiers.includes(id);

  const handleContinue = () => {
    // Pass selected modifiers to story generator
    navigate("/story-generator", {
      state: { selectedModifiers: selectedModifiers },
    });
  };

  return (
    <div className="container mx-auto px-4 flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
      <h1 className="text-4xl font-bold mb-10 text-white">
        Choose 3 Modifiers
      </h1>

      <div className="flex flex-wrap justify-center gap-6 mb-10">
        {randomModifiers.map((modifier) => (
          <div
            key={modifier.id}
            onClick={() => toggleModifier(modifier.id)}
            className={`card-container relative w-56 h-80 cursor-pointer transition-transform duration-300 transform ${
              isSelected(modifier.id) ? "scale-110" : "hover:scale-105"
            }`}
          >
            {/* Card */}
            <div
              className={`card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl w-full h-full border-2 p-4 flex flex-col ${
                isSelected(modifier.id)
                  ? "border-yellow-400"
                  : "border-gray-600"
              }`}
            >
              {/* Card Header */}
              <div className="text-center mb-2 pb-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 uppercase">
                  {modifier.category}
                </span>
                <h3 className="text-xl font-bold text-white">
                  {modifier.modifier}
                </h3>
              </div>

              {/* Card Body */}
              <div className="flex-grow flex items-center justify-center p-3">
                <p className="text-gray-300 text-center">
                  {modifier.description}
                </p>
              </div>

              {/* Selection Indicator */}
              {isSelected(modifier.id) && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  {selectedModifiers.indexOf(modifier.id) + 1}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ShaderButton
        onClick={handleContinue}
        disabled={selectedModifiers.length !== 3}
        className={`px-10 py-3 ${
          selectedModifiers.length !== 3 ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Continue to Story
      </ShaderButton>
    </div>
  );
};

export default StoryModifierSelection;
