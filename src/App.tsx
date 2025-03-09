import { Canvas } from "@react-three/fiber";
import { ShaderBackground } from "./components/ShaderBackground";
import { useColorTransition } from "./utils/useColorTransition";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import StoryGenerator from "./pages/StoryGenerator";
import EnvDebugger from "./components/EnvDebugger";

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
        <nav className="relative z-10 bg-white/80 backdrop-blur-md p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link
              to="/"
              className="text-xl font-bold text-blue-600"
            >
              Thai Reading App
            </Link>
            <div className="space-x-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600"
              >
                Home
              </Link>
              <Link
                to="/story-generator"
                className="text-gray-700 hover:text-blue-600"
              >
                Story Generator
              </Link>
            </div>
          </div>
        </nav>

        {/* Content and Routing */}
        <div className="relative min-h-screen pt-16 pb-8">
          <Routes>
            <Route
              path="/"
              element={
                <div className="container mx-auto p-4 flex items-center justify-center h-[calc(100vh-8rem)]">
                  <div className="bg-white/80 backdrop-blur-md p-8 rounded-lg shadow-lg text-center max-w-md">
                    <h1 className="text-3xl font-bold mb-4">
                      Thai Reading App
                    </h1>
                    <p className="mb-6 text-gray-600">
                      Improve your Thai reading skills with interactive stories
                      and Choose Your Own Adventure games.
                    </p>
                    <button
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md transition-transform hover:bg-blue-700 hover:scale-105 active:scale-95"
                      onClick={changeColorScheme}
                      disabled={isTransitioning}
                    >
                      <span className="font-semibold">
                        Change Background Colors
                      </span>
                    </button>
                    <div className="mt-8">
                      <Link
                        to="/story-generator"
                        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700"
                      >
                        Create Your Adventure
                      </Link>
                    </div>
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
