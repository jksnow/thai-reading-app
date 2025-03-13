import { Canvas } from "@react-three/fiber";
import { ShaderBackground } from "./components/ShaderBackground";
import { useColorTransition } from "./utils/useColorTransition";
import StoryGenerator from "./pages/StoryGenerator";
import StoryModifierSelection from "./pages/StoryModifierSelection";
import { AppStateProvider, useAppState } from "./context/AppStateContext";
import { GeneralSettings } from "./components/GeneralSettings";
import { SettingsIcon } from "./components/SettingsIcon";
import SelectedModifiersModal from "./components/SelectedModifiersModal";
import { useState } from "react";
import MainTitleScreen from "./components/MainTitleScreen";

// Main content component that uses the app state
const MainContent = () => {
  const { currentSection } = useAppState();

  // Render different components based on currentSection
  const renderContent = () => {
    switch (currentSection) {
      case "home":
        return <MainTitleScreen />;
      case "modifier-selection":
        return <StoryModifierSelection />;
      case "story-generator":
        return <StoryGenerator />;
      default:
        return <MainTitleScreen />;
    }
  };

  return (
    <div className="relative min-h-screen pt-8 pb-8">{renderContent()}</div>
  );
};

function App() {
  // Use our custom hook for color management
  const { colorA, colorB, isTransitioning, changeColorScheme } =
    useColorTransition({
      transitionDuration: 2000,
    });

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <AppStateProvider>
      <div className="fixed inset-0 w-full h-full overflow-auto">
        {/* Shader Background */}
        <div className="fixed inset-0 w-full h-full">
          <Canvas
            style={{ width: "100%", height: "100%" }}
            camera={{ position: [0, 0, 1] }}
          >
            <ShaderBackground
              colorA={colorA}
              colorB={colorB}
            />
          </Canvas>
        </div>

        {/* Settings Icon */}
        <div className="fixed top-4 right-4 z-30 text-white">
          <SettingsIcon onClick={() => setIsSettingsOpen(true)} />
        </div>

        {/* Selected Modifiers Modal */}
        <SelectedModifiersModal />

        {/* Content based on app state */}
        <MainContent />

        {/* Settings Modal */}
        <GeneralSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onChangeBackgroundMood={changeColorScheme}
          isTransitioning={isTransitioning}
        />
      </div>
    </AppStateProvider>
  );
}

export default App;
