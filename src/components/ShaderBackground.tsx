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

  // For now, we'll use default shader properties since they're no longer in the AppContext
  const shaderProps = {
    startAnimation: true,
    spinRotationSpeed: 0.5,
    moveSpeed: 3.0,
    spinAmount: 0.25,
    pixelFilter: 1500.0,
  };

  // Update shader uniforms on each frame
  useFrame((frameState) => {
    if (materialRef.current) {
      // Always update time (using fixed values since startAnimation is removed from context)
      materialRef.current.uniforms.time.value =
        frameState.clock.getElapsedTime();

      // Update resolution
      materialRef.current.uniforms.resolution.value.set(
        frameState.size.width,
        frameState.size.height
      );

      // Update colors
      materialRef.current.uniforms.colorA.value.copy(colorA);
      materialRef.current.uniforms.colorB.value.copy(colorB);

      // Update shader properties from fixed values
      materialRef.current.uniforms.spinRotationSpeed.value =
        shaderProps.spinRotationSpeed;
      materialRef.current.uniforms.moveSpeed.value = shaderProps.moveSpeed;
      materialRef.current.uniforms.spinAmount.value = shaderProps.spinAmount;
      materialRef.current.uniforms.pixelFilter.value = shaderProps.pixelFilter;
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
