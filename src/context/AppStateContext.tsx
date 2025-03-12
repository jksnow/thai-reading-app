import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the initial state interface
interface AppState {
  startAnimation: boolean;
  spinRotationSpeed: number;
  moveSpeed: number;
  spinAmount: number;
  pixelFilter: number;
  showIntro: boolean;
  initialAnimationComplete: boolean;
}

// Define the context interface including state and setter functions
interface AppStateContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  // Helper functions for common operations
  updateShaderProperty: (
    key: keyof Omit<
      AppState,
      "startAnimation" | "showIntro" | "initialAnimationComplete"
    >,
    value: number
  ) => void;
  toggleAnimation: () => void;
  completeIntroAnimation: () => void;
}

// Set default values
const defaultState: AppState = {
  startAnimation: true,
  spinRotationSpeed: 0.5,
  moveSpeed: 3.0,
  spinAmount: 0.25,
  pixelFilter: 1500.0,
  showIntro: true,
  initialAnimationComplete: false,
};

// Create the context
const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

// Create the provider component
export const AppStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>(defaultState);

  // Helper function to update shader properties
  const updateShaderProperty = (
    key: keyof Omit<
      AppState,
      "startAnimation" | "showIntro" | "initialAnimationComplete"
    >,
    value: number
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  // Toggle animation on/off
  const toggleAnimation = () => {
    setState((prev) => ({ ...prev, startAnimation: !prev.startAnimation }));
  };

  // Mark intro animation as complete
  const completeIntroAnimation = () => {
    setState((prev) => ({
      ...prev,
      showIntro: false,
      initialAnimationComplete: true,
    }));
  };

  return (
    <AppStateContext.Provider
      value={{
        state,
        setState,
        updateShaderProperty,
        toggleAnimation,
        completeIntroAnimation,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

// Custom hook for using the app state
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
