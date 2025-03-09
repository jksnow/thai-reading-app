import { Canvas } from "@react-three/fiber";
import { ShaderBackground } from "./components/ShaderBackground";
import { useColorTransition } from "./utils/useColorTransition";

function App() {
  // Use our custom hook for color management
  const { colorA, colorB, isTransitioning, changeColorScheme } =
    useColorTransition({
      transitionDuration: 2000,
    });

  return (
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

      {/* Centered Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg transition-transform hover:scale-105 active:scale-95"
          onClick={changeColorScheme}
          disabled={isTransitioning}
        >
          <span className="text-gray-900 text-xl font-semibold">
            Change Colors
          </span>
        </button>
      </div>
    </div>
  );
}

export default App;
