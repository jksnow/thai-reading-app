import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAppState } from "../context/AppStateContext";

interface StoryLoadingScreenProps {
  isVisible: boolean;
  onComplete: () => void;
}

const StoryLoadingScreen: React.FC<StoryLoadingScreenProps> = ({
  isVisible,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { isGeneratingStory, getEstimatedResponseTime } = useAppState();

  // Get current estimated time in milliseconds
  const estimatedTimeMs = getEstimatedResponseTime();
  // Convert to seconds and round for display
  const estimatedTimeSec = Math.round(estimatedTimeMs / 1000);

  // Complete the loading animation
  const completeLoading = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only complete if we haven't already
    if (!hasCompleted) {
      setProgress(100);
      setHasCompleted(true);

      // Wait for animation to finish before calling onComplete
      setTimeout(() => {
        onComplete();
        setProgress(0);
        setHasCompleted(false);
      }, 300);
    }
  };

  // Handle API completion
  useEffect(() => {
    if (!isGeneratingStory && isVisible && !hasCompleted) {
      completeLoading();
    }
  }, [isGeneratingStory, isVisible, hasCompleted]);

  // Linear progress bar that fills based on estimated time
  useEffect(() => {
    // Clean up function
    const cleanup = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (isVisible && !hasCompleted) {
      // Reset progress
      setProgress(0);

      // Update frequency (100ms)
      const updateInterval = 100;

      // Calculate how much to increment per interval
      // We'll go to 90% in the estimated time, leaving 10% buffer
      const incrementPerInterval = (90 / estimatedTimeMs) * updateInterval;

      // Start interval
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (hasCompleted) return prev;
          const newProgress = prev + incrementPerInterval;
          // Cap at 90% until API returns
          return newProgress > 90 ? 90 : newProgress;
        });
      }, updateInterval);

      return cleanup;
    } else if (!isVisible) {
      cleanup();
      setProgress(0);
      setHasCompleted(false);
    }
  }, [isVisible, hasCompleted, estimatedTimeMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900 bg-opacity-90 z-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          กำลังสร้างการผจญภัยของคุณ...
        </h2>
        <p className="text-slate-300 mb-6 text-center">
          Creating Your Adventure
        </p>

        <div className="flex justify-between text-sm text-slate-300 mb-2">
          <span>Estimated time: ~{estimatedTimeSec} seconds</span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div className="bg-slate-700 rounded-full h-4 mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <p className="text-sm text-slate-400 text-center italic">
          {progress < 90
            ? "Crafting a narrative just for you..."
            : "Almost there...finalizing your story!"}
        </p>
      </div>
    </motion.div>
  );
};

export default StoryLoadingScreen;
