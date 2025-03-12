import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import storyModifiers, { StoryModifier } from "../data/storyModifiers";
import ShaderButton from "../components/ShaderButton";

//   @keyframes float {
//   0% {
//     transform: translateY(0px) rotateX(0deg) rotateY(0deg);
//   }
//   25% {
//     transform: translateY(-5px) rotateX(1deg) rotateY(-1deg);
//   }
//   50% {
//     transform: translateY(-10px) rotateX(20deg) rotateY(0deg);
//   }
//   75% {
//     transform: translateY(-5px) rotateX(1deg) rotateY(1deg);
//   }
//   100% {
//     transform: translateY(0px) rotateX(0deg) rotateY(0deg);
//   }
// }
// Add global styles
const globalStyles = `
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .preserve-3d {
    transform-style: preserve-3d;
  }
  
  .rotate-y-0 {
    transform: rotateY(0deg);
  }
  
  .rotate-x-0 {
    transform: rotateX(0deg);
  }
  
  .rotate-y-neg5 {
    transform: rotateY(-5deg);
  }
  
  .rotate-x-5 {
    transform: rotateX(5deg);
  }
  
  @keyframes float {
    0% { 
      transform: translateY(0px) rotateX(0deg) rotateY(0deg); 
    }
    25% { 
      transform: translateY(-5px) rotateX(-5deg) rotateY(5deg); 
    }
    50% { 
      transform: translateY(-10px) rotateX(0deg) rotateY(0deg); 
    }
    75% { 
      transform: translateY(-5px) rotateX(5deg) rotateY(-5deg); 
    }
    100% { 
      transform: translateY(0px) rotateX(0deg) rotateY(0deg); 
    }
  }

  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .fly-in {
    animation: flyIn 1s cubic-bezier(0.19, 1, 0.22, 1);
    transform: translateY(100vh) rotateX(50deg) scale(0.6);
    opacity: 0;
  }
  
  @keyframes flyIn {
    0% {
      transform: translateY(100vh) rotateX(50deg) scale(0.6);
      opacity: 0;
    }
    100% {
      transform: translateY(0) rotateX(0) scale(1);
      opacity: 1;
    }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

const StoryModifierSelection = () => {
  const navigate = useNavigate();
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [randomModifiers, setRandomModifiers] = useState<StoryModifier[]>([]);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Get 5 random modifiers on component mount
  useEffect(() => {
    const getRandomModifiers = () => {
      const shuffled = [...storyModifiers].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5);
    };
    setRandomModifiers(getRandomModifiers());

    // Set animation complete after cards have flown in
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Add the styles to the document
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = globalStyles;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
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
    <div className="container mx-auto px-4 flex flex-col items-center justify-center h-[calc(100vh-8rem)] overflow-hidden">
      <h1 className="text-4xl font-bold mb-10 text-white">
        Choose 3 Modifiers
      </h1>

      <div className="flex flex-wrap justify-center gap-6 mb-10 perspective-1000">
        {randomModifiers.map((modifier, index) => {
          // Create unique animation delay for floating effect based on index
          const floatDelay = `${(index * 0.4) % 2}s`;

          return (
            <div
              key={modifier.id}
              onClick={() => toggleModifier(modifier.id)}
              className={`card-container relative w-56 h-80 cursor-pointer transition-all duration-300 
              ${animationComplete ? "animate-float" : ""}
              ${isSelected(modifier.id) ? "z-20" : "z-10 hover:z-20"}
              ${animationComplete ? "" : "fly-in"}`}
              style={{
                animationDelay: animationComplete
                  ? floatDelay
                  : `${index * 150}ms`,
                animationFillMode: "forwards",
              }}
            >
              {/* Card */}
              <div
                className={`card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl w-full h-full 
                border-2 p-4 flex flex-col transition-all duration-300 ease-out transform preserve-3d
                ${
                  isSelected(modifier.id)
                    ? "border-yellow-400 translate-y-[-15px] rotate-y-0 rotate-x-0"
                    : "border-gray-600 hover:translate-y-[-10px] hover:rotate-y-neg5 hover:rotate-x-5"
                }
                ${animationComplete ? "shadow-2xl shadow-indigo-900/20" : ""}`}
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
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 w-8 h-8 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {selectedModifiers.indexOf(modifier.id) + 1}
                  </div>
                )}

                {/* Card shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 rounded-xl pointer-events-none transition-opacity duration-300 group-hover:opacity-100"></div>
              </div>
            </div>
          );
        })}
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
