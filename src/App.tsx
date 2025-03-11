import { Canvas } from "@react-three/fiber";
import { ShaderBackground } from "./components/ShaderBackground";
import { useColorTransition } from "./utils/useColorTransition";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import StoryGenerator from "./pages/StoryGenerator";
import ShaderButton from "./components/ShaderButton";
import { AppStateProvider } from "./context/AppStateContext";
import { GeneralSettings } from "./components/GeneralSettings";
import { SettingsIcon } from "./components/SettingsIcon";
import { useState } from "react";

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
      <BrowserRouter>
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
          <div className="fixed top-4 right-4 z-30">
            <SettingsIcon onClick={() => setIsSettingsOpen(true)} />
          </div>

          {/* Content and Routing */}
          <div className="relative min-h-screen pt-20 pb-8">
            <Routes>
              <Route
                path="/"
                element={
                  <div className="container mx-auto p-4 flex items-center justify-center h-[calc(100vh-8rem)]">
                    <div className="adventure-container p-8 max-w-md shadow-lg">
                      <h1 className="text-3xl font-bold mb-4 text-ink text-center">
                        Thai Reading Adventure
                      </h1>
                      <p className="mb-6 text-ink text-center">
                        Improve your Thai reading skills with interactive
                        stories and Choose Your Own Adventure games.
                      </p>
                      <Link
                        to="/story-generator"
                        className="block w-full"
                      >
                        <ShaderButton
                          variant="primary"
                          fullWidth
                          className="py-3"
                        >
                          Create Your Adventure
                        </ShaderButton>
                      </Link>
                    </div>
                  </div>
                }
              />
              <Route
                path="/story-generator"
                element={<StoryGenerator />}
              />
            </Routes>
          </div>

          {/* Settings Modal */}
          <GeneralSettings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onChangeBackgroundMood={changeColorScheme}
            isTransitioning={isTransitioning}
          />
        </div>
      </BrowserRouter>
    </AppStateProvider>
  );
}

export default App;
