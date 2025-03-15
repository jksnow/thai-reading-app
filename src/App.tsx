import { Canvas } from "@react-three/fiber";
import { ShaderBackground } from "./components/ShaderBackground";
import StoryGenerator from "./pages/StoryGenerator";
import StoryModifierSelection from "./pages/StoryModifierSelection";
import { AppStateProvider, useAppState } from "./context/AppStateContext";
import SelectedModifiersModal from "./components/SelectedModifiersModal";
import MainTitleScreen from "./components/MainTitleScreen";
import SocialMediaButtons from "./components/SocialMediaButtons";

// Component for the background and main content
const AppContent = () => {
  // Get colors from context
  const { colorA, colorB, currentSection } = useAppState();

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

      {/* Selected Modifiers Modal */}
      <SelectedModifiersModal />

      {/* Social Media Buttons */}
      <SocialMediaButtons />

      {/* Content based on app state */}
      <div className="relative min-h-screen pt-8 pb-8">{renderContent()}</div>
    </div>
  );
};

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

export default App;
