import { useRef } from "react";
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

export function ShaderBackground({ colorA, colorB }: ShaderBackgroundProps) {
  const materialRef = useRef<BalatroPaintShaderMaterialImpl>(null);
  const { state: appState } = useAppState();

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

      // Update colors
      materialRef.current.uniforms.colorA.value.copy(colorA);
      materialRef.current.uniforms.colorB.value.copy(colorB);

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
