import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Import side-effects first to ensure the material is registered
import "../utils/shaderMaterials";
// Then import the type
import type { BalatroPaintShaderMaterialImpl } from "../utils/shaderMaterials";
import { useAppState } from "../context/AppStateContext";

interface ShaderBackgroundProps {
  colorA: THREE.Color;
  colorB: THREE.Color;
}

// Initial dark colors for intro animation
const DARK_COLOR = new THREE.Color(0.01, 0.01, 0.01);

export function ShaderBackground({ colorA, colorB }: ShaderBackgroundProps) {
  const materialRef = useRef<BalatroPaintShaderMaterialImpl>(null);
  const { state: appState } = useAppState();
  const initialTransitionRef = useRef({
    started: false,
    startTime: 0,
    completed: false,
  });

  // Handle color transitions after intro animation completes
  useEffect(() => {
    if (
      appState.initialAnimationComplete &&
      !initialTransitionRef.current.started
    ) {
      initialTransitionRef.current.started = true;
      initialTransitionRef.current.startTime = Date.now();
    }
  }, [appState.initialAnimationComplete]);

  // Update shader uniforms on each frame
  useFrame((frameState) => {
    if (materialRef.current) {
      // Only update time if animation is active
      if (appState.startAnimation) {
        materialRef.current.uniforms.time.value =
          frameState.clock.getElapsedTime();
      }

      // Update resolution
      materialRef.current.uniforms.resolution.value.set(
        frameState.size.width,
        frameState.size.height
      );

      // Set colors based on animation state
      if (appState.showIntro) {
        // During intro: both colors dark
        materialRef.current.uniforms.colorA.value.copy(DARK_COLOR);
        materialRef.current.uniforms.colorB.value.copy(DARK_COLOR);
        materialRef.current.uniforms.lighting.value = 1;
      } else if (
        initialTransitionRef.current.started &&
        !initialTransitionRef.current.completed
      ) {
        // Handle transition from dark to default colors
        const elapsed =
          (Date.now() - initialTransitionRef.current.startTime) / 1000;

        // First 1.5 seconds: transition colorA
        if (elapsed < 1.5) {
          const t = Math.min(1, elapsed / 1.5);
          const colorBTemp = new THREE.Color().copy(DARK_COLOR).lerp(colorB, t);

          materialRef.current.uniforms.colorA.value.copy(DARK_COLOR);
          materialRef.current.uniforms.colorB.value.copy(colorBTemp);
          materialRef.current.uniforms.lighting.value = 0.4;
        }
        // Next 1.5 seconds: transition colorB
        else if (elapsed < 3) {
          const t = Math.min(1, (elapsed - 1.5) / 1.5);
          materialRef.current.uniforms.colorB.value.copy(colorB);
          const colorATemp = new THREE.Color().copy(DARK_COLOR).lerp(colorA, t);
          materialRef.current.uniforms.colorA.value.copy(colorATemp);
        }
        // Transition complete
        else {
          initialTransitionRef.current.completed = true;
        }
      } else if (initialTransitionRef.current.completed) {
        // After transition: use provided colors
        materialRef.current.uniforms.colorA.value.copy(colorA);
        materialRef.current.uniforms.colorB.value.copy(colorB);
      }

      // Update shader properties from app state
      materialRef.current.uniforms.spinRotationSpeed.value =
        appState.spinRotationSpeed;
      materialRef.current.uniforms.moveSpeed.value = appState.moveSpeed;
      materialRef.current.uniforms.spinAmount.value = appState.spinAmount;
      materialRef.current.uniforms.pixelFilter.value = appState.pixelFilter;
    }
  });

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <balatroPaintShaderMaterial
        ref={materialRef}
        transparent={true}
      />
    </mesh>
  );
}
