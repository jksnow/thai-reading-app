import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

interface ShaderSettings {
  spinRotationSpeed: number;
  moveSpeed: number;
  spinAmount: number;
}

interface ShaderSettingsContextType {
  settings: ShaderSettings;
  updateSettings: (newSettings: Partial<ShaderSettings>) => void;
  isTransitioning: boolean;
}

const ShaderSettingsContext = createContext<
  ShaderSettingsContextType | undefined
>(undefined);

export const useShaderSettings = () => {
  const context = useContext(ShaderSettingsContext);
  if (!context) {
    throw new Error(
      "useShaderSettings must be used within a ShaderSettingsProvider"
    );
  }
  return context;
};

const DEFAULT_SETTINGS: ShaderSettings = {
  spinRotationSpeed: 0.2,
  moveSpeed: 1.5,
  spinAmount: 0.1,
};

export const ShaderSettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { userData } = useAuth();
  const [settings, setSettings] = useState<ShaderSettings>(DEFAULT_SETTINGS);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Animation state
  const startSettings = useRef<ShaderSettings>(DEFAULT_SETTINGS);
  const targetSettings = useRef<ShaderSettings>(DEFAULT_SETTINGS);
  const startTime = useRef<number>(0);
  const animationFrame = useRef<number | undefined>(undefined);
  const TRANSITION_DURATION = 500; // 500ms transition

  // Load initial settings from user data
  useEffect(() => {
    if (userData?.settings) {
      const newSettings = {
        spinRotationSpeed:
          userData.settings.spinRotationSpeed ??
          DEFAULT_SETTINGS.spinRotationSpeed,
        moveSpeed: userData.settings.moveSpeed ?? DEFAULT_SETTINGS.moveSpeed,
        spinAmount: userData.settings.spinAmount ?? DEFAULT_SETTINGS.spinAmount,
      };
      setSettings(newSettings);
      startSettings.current = newSettings;
      targetSettings.current = newSettings;
    }
  }, [userData]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  const updateSettings = (newSettings: Partial<ShaderSettings>) => {
    // Cancel any ongoing animation
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    // Store start and target settings
    startSettings.current = settings;
    targetSettings.current = { ...settings, ...newSettings };
    startTime.current = performance.now();
    setIsTransitioning(true);

    // Start animation
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime.current;
      const progress = Math.min(elapsed / TRANSITION_DURATION, 1);

      // Cubic ease-out function
      const eased = 1 - Math.pow(1 - progress, 3);

      // Interpolate between start and target values
      const interpolatedSettings = {
        spinRotationSpeed: lerp(
          startSettings.current.spinRotationSpeed,
          targetSettings.current.spinRotationSpeed,
          eased
        ),
        moveSpeed: lerp(
          startSettings.current.moveSpeed,
          targetSettings.current.moveSpeed,
          eased
        ),
        spinAmount: lerp(
          startSettings.current.spinAmount,
          targetSettings.current.spinAmount,
          eased
        ),
      };

      setSettings(interpolatedSettings);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        // Ensure we end up exactly at the target values
        setSettings(targetSettings.current);
        setIsTransitioning(false);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);
  };

  return (
    <ShaderSettingsContext.Provider
      value={{ settings, updateSettings, isTransitioning }}
    >
      {children}
    </ShaderSettingsContext.Provider>
  );
};

// Helper function for linear interpolation
const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t;
};
