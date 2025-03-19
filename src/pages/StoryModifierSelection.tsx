import { useState, useEffect, useRef, useMemo } from "react";
import storyModifiers, {
  StoryModifier,
  ModifierCategory,
} from "../data/storyModifiers";
import ButtonOptions from "../components/ButtonOptions";
import { useAppState } from "../context/AppStateContext";
import GlobalButtonContainer from "../components/GlobalButtonContainer";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { CURRENT_PROMPT_VERSION } from "../types/user";

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
  
  @keyframes sparkle {
    0%, 100% { 
      opacity: 0;
      transform: scale(0);
    }
    50% { 
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .sparkle {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: white;
    pointer-events: none;
  }

  .star {
    position: absolute;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 3px 1px rgba(255, 255, 255, 0.3);
    z-index: 1;
  }
  
  .star-1 { animation: star-anim 3s ease-out infinite; animation-delay: 0.5s; }
  .star-2 { animation: star-anim 4s ease-out infinite; animation-delay: 1s; }
  .star-3 { animation: star-anim 3.5s ease-out infinite; animation-delay: 1.5s; }
  .star-4 { animation: star-anim 4.5s ease-out infinite; animation-delay: 2s; }
  .star-5 { animation: star-anim 5s ease-out infinite; animation-delay: 2.5s; }
  .star-6 { animation: star-anim 3.2s ease-out infinite; animation-delay: 3s; }
  .star-7 { animation: star-anim 4.2s ease-out infinite; animation-delay: 3.5s; }
  .star-8 { animation: star-anim 3.8s ease-out infinite; animation-delay: 4s; }
  
  @keyframes star-anim {
    0% { transform: translateY(0px) scale(0); opacity: 0; }
    30% { transform: translateY(-10px) scale(1); opacity: 0.8; }
    70% { transform: translateY(-20px) scale(0.8); opacity: 0.4; }
    100% { transform: translateY(-30px) scale(0); opacity: 0; }
  }

  .magic-stars {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
    z-index: 2;
  }
`;

// Pre-define a set of static star positions
const staticStarPositions = [
  { left: "15%", top: "20%", size: "3px", className: "star-1" },
  { left: "30%", top: "35%", size: "4px", className: "star-2" },
  { left: "70%", top: "15%", size: "3px", className: "star-3" },
  { left: "85%", top: "40%", size: "2px", className: "star-4" },
  { left: "55%", top: "65%", size: "3px", className: "star-5" },
  { left: "20%", top: "75%", size: "4px", className: "star-6" },
  { left: "90%", top: "80%", size: "3px", className: "star-7" },
  { left: "40%", top: "85%", size: "2px", className: "star-8" },
];

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

// Get styling based on category with fallback
const getCategoryStyles = (category: string) => {
  return (
    categoryStyleMap[category as ModifierCategory] || {
      background: "from-indigo-900 to-indigo-700",
      border: "border-indigo-400/30",
      categoryText: "text-indigo-300",
      titleGradient: "from-white to-indigo-200",
      bodyText: "text-indigo-100",
    }
  );
};

const StoryModifierSelection = () => {
  const { setSelectedModifiers, setCurrentSection } = useAppState();
  const { currentUser } = useAuth();
  const [localSelectedModifiers, setLocalSelectedModifiers] = useState<
    string[]
  >([]);
  const [randomModifiers, setRandomModifiers] = useState<StoryModifier[]>([]);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

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
    setLocalSelectedModifiers((current) => {
      // If already selected, remove it
      if (current.includes(id)) {
        return current.filter((modId) => modId !== id);
      }
      // If already have 3 selections, don't allow more
      if (current.length < 3) {
        return [...current, id];
      }
      return current;
    });
  };

  const isSelected = (id: string) => localSelectedModifiers.includes(id);

  const handleContinue = async () => {
    if (localSelectedModifiers.length !== 3 || isNavigating) return;

    setIsNavigating(true);

    try {
      // Save to global state
      setSelectedModifiers(localSelectedModifiers);

      // Save to MongoDB
      if (currentUser) {
        try {
          await userService.updateUser(currentUser.uid, {
            currentStory: {
              selectedModifiers: localSelectedModifiers,
              promptVersion: CURRENT_PROMPT_VERSION,
            },
          });
        } catch (error) {
          console.error("Error saving modifiers to database:", error);
          // Continue anyway since the app state is updated
        }
      }

      // Navigate to story generator
      setCurrentSection("story-generator");
    } catch (error) {
      console.error("Error during navigation:", error);
      setIsNavigating(false);
    }
  };

  // Create stars component - memoized to prevent recreation on every render
  const StarField = useMemo(() => {
    return (
      <div className="magic-stars absolute inset-0 pointer-events-none">
        {staticStarPositions.map((star, i) => (
          <div
            key={i}
            className={`star ${star.className}`}
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
            }}
          />
        ))}
      </div>
    );
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-10 text-white">
          Choose 3 Modifiers
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-10">
          {randomModifiers.map((modifier, index) => {
            // Create unique animation delay for floating effect based on index
            const floatDelay = `${(index * 0.4) % 2}s`;

            // Get styling based on category
            const styles = getCategoryStyles(modifier.category);

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
                <div
                  className={`card bg-gradient-to-br ${
                    styles.background
                  } rounded-xl shadow-xl w-full h-full
                    transform preserve-3d relative drop-shadow-[7px_7px_5px_rgba(10,10,10,0.8)]
                    ${
                      isSelected(modifier.id)
                        ? "translate-y-[-15px] rotate-y-0 rotate-x-0 scale-105 border-2 border-yellow-400"
                        : `hover:translate-y-[-10px] hover:rotate-y-neg5 hover:rotate-x-5 border ${styles.border}`
                    }
                    ${
                      animationComplete ? "shadow-2xl shadow-indigo-900/20" : ""
                    } 
                    transition-all duration-300 ease-out`}
                >
                  <div className="p-4 flex flex-col h-full w-full relative">
                    <div
                      className={`text-center mb-3 pb-2 border-b ${styles.border}`}
                    >
                      <span
                        className={`text-xs ${styles.categoryText} uppercase tracking-widest font-semibold`}
                      >
                        {modifier.category}
                      </span>
                      <h3
                        className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${styles.titleGradient} mt-1`}
                      >
                        {modifier.modifier}
                      </h3>
                    </div>

                    <div className="flex-grow flex items-center justify-center p-3 relative">
                      {StarField}
                      <p
                        className={`${styles.bodyText} text-center relative z-10`}
                      >
                        {modifier.description}
                      </p>
                    </div>

                    <div
                      className={`absolute -inset-1 rounded-xl ${
                        isSelected(modifier.id) ? "bg-indigo-500/20" : ""
                      } blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    ></div>
                  </div>

                  {isSelected(modifier.id) && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-300 to-yellow-500 text-gray-900 w-9 h-9 rounded-full flex items-center justify-center font-bold animate-pulse shadow-lg shadow-yellow-400/50 z-30">
                      {localSelectedModifiers.indexOf(modifier.id) + 1}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <ButtonOptions
          onClick={handleContinue}
          variant="blue"
          disabled={localSelectedModifiers.length !== 3 || isNavigating}
          padding="py-3 px-10"
        >
          {isNavigating ? "Loading..." : "Continue to Story Generator"}
        </ButtonOptions>

        <GlobalButtonContainer />
      </div>
    </div>
  );
};

export default StoryModifierSelection;
