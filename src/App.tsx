import { Canvas } from "@react-three/fiber";
import { ShaderBackground } from "./components/ShaderBackground";
import { useColorTransition } from "./utils/useColorTransition";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import StoryGenerator from "./pages/StoryGenerator";
import EnvDebugger from "./components/EnvDebugger";
import ShaderButton from "./components/ShaderButton";

function App() {
  // Use our custom hook for color management
  const { colorA, colorB, isTransitioning, changeColorScheme } =
    useColorTransition({
      transitionDuration: 2000,
    });

  return (
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

        {/* Navigation */}
        <nav className="relative z-20 bg-white shadow-lg border-b border-parchment-dark">
          <div className="container mx-auto flex justify-between items-center py-4 px-6">
            <Link
              to="/"
              className="text-xl font-serif font-bold text-accent-primary"
            >
              Thai Reading Adventure
            </Link>
            <div className="space-x-4">
              <Link
                to="/"
                className="text-ink hover:text-accent-primary transition-colors"
              >
                Home
              </Link>
              <Link
                to="/story-generator"
                className="text-ink hover:text-accent-primary transition-colors"
              >
                Story Generator
              </Link>
            </div>
          </div>
        </nav>

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
                      Improve your Thai reading skills with interactive stories
                      and Choose Your Own Adventure games.
                    </p>
                    <ShaderButton
                      variant="tertiary"
                      onClick={changeColorScheme}
                      disabled={isTransitioning}
                      fullWidth
                      className="mb-4 py-3"
                    >
                      <span className="font-medium">
                        Change Background Mood
                      </span>
                    </ShaderButton>
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

        {/* Environment Variable Debugger */}
        <EnvDebugger />
      </div>
    </BrowserRouter>
  );
}

export default App;
