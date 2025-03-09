import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Import side-effects first to ensure the material is registered
import "../utils/shaderMaterials";
// Then import the type
import type { BalatroPaintShaderMaterialImpl } from "../utils/shaderMaterials";

interface ShaderBackgroundProps {
  colorA: THREE.Color;
  colorB: THREE.Color;
}

export function ShaderBackground({ colorA, colorB }: ShaderBackgroundProps) {
  const materialRef = useRef<BalatroPaintShaderMaterialImpl>(null);

  // Update shader uniforms on each frame
  useFrame((state) => {
    if (materialRef.current) {
      // Update time and resolution
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.resolution.value.set(
        state.size.width,
        state.size.height
      );

      // Update colors
      materialRef.current.uniforms.colorA.value.copy(colorA);
      materialRef.current.uniforms.colorB.value.copy(colorB);
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
