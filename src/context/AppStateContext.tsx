import React, { createContext, useContext, useState, useEffect } from "react";
import {
  StorySegment as Story,
  Choice as StoryChoice,
} from "../utils/storyUtils";
import { setApiResponseTimeCallback } from "../api/deepseekService";
import responseTimeService from "../api/responseTimeService";

// Define the section types
export type AppSection = "home" | "modifier-selection" | "story-generator";

// Define the initial state interface
interface AppState {
  currentStory: Story | null;
  storyHistory: Story[];
  isGeneratingStory: boolean;
  apiResponseTimes: number[];
  estimatedResponseTime: number;
  selectedModifiers: string[];
  currentSection: AppSection;
  setCurrentStory: (story: Story | null) => void;
  addStoryToHistory: (story: Story) => void;
  resetStory: () => void;
  setIsGeneratingStory: (isGenerating: boolean) => void;
  setSelectedModifiers: (modifiers: string[]) => void;
  recordApiResponseTime: (timeInMs: number) => void;
  getEstimatedResponseTime: () => number;
  setCurrentSection: (section: AppSection) => void;
}

// Define the context interface including state and setter functions
interface AppStateContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  // Helper functions for common operations
  updateShaderProperty: (
    key: keyof Omit<
      AppState,
      | "startAnimation"
      | "selectedModifiers"
      | "storyOptions"
      | "isGeneratingStory"
      | "apiResponseTimes"
      | "estimatedResponseTime"
    >,
    value: number
  ) => void;
  toggleAnimation: () => void;
  setStoryOptions: (options: Record<string, any>) => void;
}

// Set default values
const defaultState: AppState = {
  currentStory: null,
  storyHistory: [],
  isGeneratingStory: false,
  apiResponseTimes: [],
  estimatedResponseTime: 8000, // Default 8 seconds
  selectedModifiers: [],
  currentSection: "home", // Default to home screen
  setCurrentStory: () => {},
  addStoryToHistory: () => {},
  resetStory: () => {},
  setIsGeneratingStory: () => {},
  setSelectedModifiers: () => {},
  recordApiResponseTime: () => {},
  getEstimatedResponseTime: () => 8000,
  setCurrentSection: () => {},
};

// Create the context
const AppStateContext = createContext<AppState | undefined>(undefined);

// Create the provider component
export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [storyHistory, setStoryHistory] = useState<Story[]>([]);
  const [isGeneratingStory, setIsGeneratingStory] = useState<boolean>(false);
  const [apiResponseTimes, setApiResponseTimes] = useState<number[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  // Default estimated time to 8 seconds if no data yet
  const [estimatedResponseTime, setEstimatedResponseTime] =
    useState<number>(8000);
  // State to track current section
  const [currentSection, setCurrentSection] = useState<AppSection>("home");

  // Fetch the initial estimated response time from the database
  useEffect(() => {
    const fetchInitialEstimate = async () => {
      try {
        const avgTime = await responseTimeService.fetchAverageResponseTime();
        if (avgTime) {
          setEstimatedResponseTime(avgTime);
          console.log("Loaded initial response time estimate:", avgTime);
        }
      } catch (error) {
        console.error("Error loading initial response time estimate:", error);
        // Continue with the default value (8000ms) if we can't fetch from server
        console.log("Using default response time estimate of 8000ms");
      }
    };

    fetchInitialEstimate();
  }, []);

  // Initialize deepseekService callback for API timing
  useEffect(() => {
    setApiResponseTimeCallback((timeInMs) => {
      recordApiResponseTime(timeInMs);
    });

    // Clean up when component unmounts
    return () => {
      setApiResponseTimeCallback(null);
    };
  }, []);

  const addStoryToHistory = (story: Story) => {
    setStoryHistory((prevHistory) => [...prevHistory, story]);
  };

  const resetStory = () => {
    setCurrentStory(null);
    setStoryHistory([]);
  };

  const recordApiResponseTime = (timeInMs: number) => {
    // Add the new time to the array
    setApiResponseTimes((prevTimes) => {
      const newTimes = [...prevTimes, timeInMs];

      // Keep only the last 5 response times to keep the average recent
      const recentTimes = newTimes.slice(-5);

      // Calculate new average
      if (recentTimes.length > 0) {
        const average =
          recentTimes.reduce((sum, time) => sum + time, 0) / recentTimes.length;

        // Add a small buffer (10%) to the estimated time to account for variations
        const estimatedTime = Math.round(average * 1.1);
        setEstimatedResponseTime(estimatedTime);

        // Log for debugging
        console.log(
          `API response time: ${timeInMs}ms, New estimated time: ${estimatedTime}ms`
        );

        // Persist the new response time to the database
        responseTimeService
          .updateAverageResponseTime(timeInMs)
          .catch((error) =>
            console.error("Error saving response time to DB:", error)
          );
      }

      return recentTimes;
    });
  };

  const getEstimatedResponseTime = () => {
    return estimatedResponseTime;
  };

  const value: AppState = {
    currentStory,
    storyHistory,
    isGeneratingStory,
    apiResponseTimes,
    estimatedResponseTime,
    selectedModifiers,
    currentSection,
    setCurrentStory,
    addStoryToHistory,
    resetStory,
    setIsGeneratingStory,
    setSelectedModifiers,
    recordApiResponseTime,
    getEstimatedResponseTime,
    setCurrentSection,
  };

  return (
    <AppStateContext.Provider value={value}>
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
