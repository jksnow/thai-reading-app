import { useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { BALATRO_COLOR_SCHEMES } from "./colorSchemes";

export interface ColorScheme {
  colorA: THREE.Color;
  colorB: THREE.Color;
}

interface UseColorTransitionOptions {
  transitionDuration?: number;
}

export function useColorTransition({
  transitionDuration = 3000,
}: UseColorTransitionOptions = {}) {
  // Current color scheme index
  const [schemeIndex, setSchemeIndex] = useState(0);

  // Current displayed colors
  const [colorA, setColorA] = useState(BALATRO_COLOR_SCHEMES[0].colorA.clone());
  const [colorB, setColorB] = useState(BALATRO_COLOR_SCHEMES[0].colorB.clone());

  // Track transition state with both ref (for internal use) and state (for React)
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionRef = useRef(false);

  // Animation state
  const startColorA = useRef(new THREE.Color());
  const startColorB = useRef(new THREE.Color());
  const endColorA = useRef(new THREE.Color());
  const endColorB = useRef(new THREE.Color());
  const startTime = useRef(0);

  // Temp colors for animation
  const tempColorA = useRef(new THREE.Color());
  const tempColorB = useRef(new THREE.Color());

  // Change to the next color scheme
  const changeColorScheme = useCallback(() => {
    // Don't start a new transition if one is in progress
    if (transitionRef.current) return;

    // Calculate next scheme index
    const nextIndex = (schemeIndex + 1) % BALATRO_COLOR_SCHEMES.length;
    setSchemeIndex(nextIndex);

    // Store the start colors (current colors)
    startColorA.current.copy(colorA);
    startColorB.current.copy(colorB);

    // Store the end colors (next scheme)
    endColorA.current.copy(BALATRO_COLOR_SCHEMES[nextIndex].colorA);
    endColorB.current.copy(BALATRO_COLOR_SCHEMES[nextIndex].colorB);

    // Start the transition
    startTime.current = performance.now();
    transitionRef.current = true;
    setIsTransitioning(true);
  }, [schemeIndex, colorA, colorB]);

  // Set a specific color scheme by index
  const setColorScheme = useCallback(
    (index: number) => {
      if (transitionRef.current || index === schemeIndex) return;

      // Ensure index is valid
      const safeIndex = Math.max(
        0,
        Math.min(index, BALATRO_COLOR_SCHEMES.length - 1)
      );
      setSchemeIndex(safeIndex);

      // Store the start colors (current colors)
      startColorA.current.copy(colorA);
      startColorB.current.copy(colorB);

      // Store the end colors (target scheme)
      endColorA.current.copy(BALATRO_COLOR_SCHEMES[safeIndex].colorA);
      endColorB.current.copy(BALATRO_COLOR_SCHEMES[safeIndex].colorB);

      // Start the transition
      startTime.current = performance.now();
      transitionRef.current = true;
      setIsTransitioning(true);
    },
    [schemeIndex, colorA, colorB]
  );

  // Animation effect for color transitions
  useEffect(() => {
    // Only run animation when transitioning
    if (!isTransitioning) return;

    let animationFrameId: number;

    const animateFrame = (timestamp: number) => {
      // Calculate progress (0 to 1)
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / transitionDuration, 1);

      // Ease function (cubic ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Interpolate colors
      tempColorA.current.copy(startColorA.current);
      tempColorA.current.lerp(endColorA.current, easedProgress);

      tempColorB.current.copy(startColorB.current);
      tempColorB.current.lerp(endColorB.current, easedProgress);

      // Update state with new colors
      setColorA(tempColorA.current.clone());
      setColorB(tempColorB.current.clone());

      // Continue or end transition
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateFrame);
      } else {
        // Ensure final colors are exactly correct
        setColorA(endColorA.current.clone());
        setColorB(endColorB.current.clone());
        transitionRef.current = false;
        setIsTransitioning(false);
      }
    };

    // Start animation
    animationFrameId = requestAnimationFrame(animateFrame);

    // Clean up animation on unmount or re-run
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isTransitioning, transitionDuration]);

  return {
    colorA,
    colorB,
    isTransitioning,
    changeColorScheme,
    setColorScheme,
    currentSchemeIndex: schemeIndex,
  };
}
