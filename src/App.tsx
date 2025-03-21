import { Canvas } from "@react-three/fiber";
import { ShaderBackground } from "./components/ShaderBackground";
import StoryGenerator from "./pages/StoryGenerator";
import StoryModifierSelection from "./pages/StoryModifierSelection";
import { AppStateProvider, useAppState } from "./context/AppStateContext";
import SelectedModifiersModal from "./components/SelectedModifiersModal";
import MainTitleScreen from "./components/MainTitleScreen";
import SocialMediaButtons from "./components/SocialMediaButtons";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ShaderSettingsProvider } from "./context/ShaderSettingsContext";
import AuthForm from "./components/AuthForm";

const APP_VERSION = "0.8.43"; // Beta version

// Component for the background and main content
const AppContent = () => {
  // Get colors from context
  const { colorA, colorB, currentSection } = useAppState();
  const { currentUser, loading } = useAuth();

  // Render different components based on currentSection and auth state
  const renderContent = () => {
    // If still loading auth state, return loading indicator
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    // If not authenticated, show auth form
    if (!currentUser) {
      return (
        <div className="flex flex-col justify-center items-center h-screen">
          <AuthForm />
        </div>
      );
    }

    // Otherwise show app content based on current section
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
      {/* Version number */}
      <div className="fixed top-2 right-4 text-white text-xs opacity-30 z-50 font-mono">
        v{APP_VERSION}
      </div>

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

      {/* Selected Modifiers Modal (only when authenticated) */}
      {currentUser && <SelectedModifiersModal />}

      {/* Social Media Buttons */}
      <SocialMediaButtons />

      {/* Content based on app state */}
      <div className="relative min-h-screen">{renderContent()}</div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppStateProvider>
        <ShaderSettingsProvider>
          <AppContent />
        </ShaderSettingsProvider>
      </AppStateProvider>
    </AuthProvider>
  );
};

export default App;
