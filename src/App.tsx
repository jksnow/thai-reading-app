import { Canvas } from "@react-three/fiber";
import { ShaderBackground } from "./components/ShaderBackground";
import { useColorTransition } from "./utils/useColorTransition";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import StoryGeneratorPage from "./pages/StoryGeneratorPage";
import StoryPage from "./pages/StoryPage";
import DemoPage from "./pages/DemoPage";
import Navbar from "./components/Navbar";

function App() {
  // Use our custom hook for color management
  const { colorA, colorB } = useColorTransition({
    transitionDuration: 2000,
  });

  return (
    <BrowserRouter>
      <div className="fixed inset-0 w-full h-full overflow-hidden">
        {/* Shader Background */}
        <div className="absolute inset-0 w-full h-full">
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

        {/* Navbar */}
        <Navbar />

        {/* Content and Routing */}
        <div className="absolute inset-0 flex items-center justify-center pt-16">
          <div className="w-full max-w-4xl px-4">
            <Routes>
              <Route
                path="/"
                element={<WelcomePage />}
              />
              <Route
                path="/login"
                element={<LoginPage />}
              />
              <Route
                path="/register"
                element={<RegisterPage />}
              />
              <Route
                path="/demo"
                element={<DemoPage />}
              />
              <Route
                path="/dashboard"
                element={<DashboardPage />}
              />
              <Route
                path="/story-generator/:templateId"
                element={<StoryGeneratorPage />}
              />
              <Route
                path="/story/:storyId"
                element={<StoryPage />}
              />
              <Route
                path="*"
                element={
                  <Navigate
                    to="/"
                    replace
                  />
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
