import { Canvas } from "@react-three/fiber";
import { ShaderBackground } from "./components/ShaderBackground";
import { useColorTransition } from "./utils/useColorTransition";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StoryGenerator from "./pages/StoryGenerator";
import StoryModifierSelection from "./pages/StoryModifierSelection";
import { AppStateProvider } from "./context/AppStateContext";
import { GeneralSettings } from "./components/GeneralSettings";
import { SettingsIcon } from "./components/SettingsIcon";
import SelectedModifiersModal from "./components/SelectedModifiersModal";
import { useState } from "react";
import thaiTaleLogo from "./assets/ThaiTaleLogo.png";
import ButtonOptions from "./components/ButtonOptions";
import ButtonContainer from "./components/ButtonContainer";

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
          <div className="fixed top-4 right-4 z-30 text-white">
            <SettingsIcon onClick={() => setIsSettingsOpen(true)} />
          </div>

          {/* Selected Modifiers Modal */}
          <SelectedModifiersModal />

          {/* Content and Routing */}
          <div className="relative min-h-screen pt-8 pb-8">
            <Routes>
              <Route
                path="/"
                element={
                  <div className="container mx-auto p-4 flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
                    {/* Logo and Title - Large, taking significant screen real estate */}
                    <div className="flex items-center justify-center mb-16 mt-[-2rem]">
                      {/* add text-shadow: 0.025em 0.025em 0 gray, 0.05em 0.05em 0 blue, 0.075em 0.075em 0 red, 0.1em 0.1em 0 black;*/}
                      <h1
                        className="special-text text-white inline-flex items-center"
                        style={{
                          fontSize: "16rem",
                          textShadow:
                            "0.025em 0.025em 0 gray, 0.05em 0.05em 0 black",
                        }}
                      >
                        Thai
                        <img
                          src={thaiTaleLogo}
                          alt="Thai Tale Logo"
                          className="mx-6 w-auto"
                          style={{ height: "20rem" }}
                        />
                        Tale
                      </h1>
                    </div>

                    {/* Button Container */}
                    <ButtonContainer>
                      <ButtonOptions
                        to="/modifier-selection"
                        variant="primary"
                      >
                        START
                      </ButtonOptions>

                      <ButtonOptions variant="secondary">OPTIONS</ButtonOptions>

                      <ButtonOptions variant="tertiary">
                        COLLECTION
                      </ButtonOptions>
                    </ButtonContainer>
                  </div>
                }
              />
              <Route
                path="/modifier-selection"
                element={<StoryModifierSelection />}
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
