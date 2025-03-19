import React, { useRef, useEffect, useState } from "react";
import { useFrame, Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Shader for dissolution effect
const fragmentShader = `
  uniform float time;
  uniform sampler2D texture1;
  uniform vec3 color;
  varying vec2 vUv;

  void main() {
    // Create noise effect
    float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
    
    // Animate the dissolution
    float dissolveEdge = smoothstep(0.3, 0.7, noise) * (1.0 - time);
    float alpha = smoothstep(0.0, 0.1, dissolveEdge);
    
    // Sample from texture
    vec4 texColor = texture2D(texture1, vUv);
    
    // Final color with dissolution effect
    gl_FragColor = vec4(texColor.rgb, texColor.a * alpha);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// A simplified version of the IntroAnimation that doesn't depend on context
export const IntroAnimation: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);

  // Auto-hide the intro after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  if (!showIntro) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <Canvas>
        <IntroCard onComplete={() => setShowIntro(false)} />
      </Canvas>
    </div>
  );
};

// Card component with dissolution effect
const IntroCard = ({ onComplete }: { onComplete: () => void }) => {
  const { viewport } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [startTime] = useState(Date.now());
  const [animationComplete, setAnimationComplete] = useState(false);
  const logoTexture = useRef<THREE.CanvasTexture | null>(null);

  // Create canvas texture for ThaiTale logo
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext("2d");

    if (context) {
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.font = "bold 72px serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#333";
      context.fillText("ThaiTale", canvas.width / 2, canvas.height / 2);

      logoTexture.current = new THREE.CanvasTexture(canvas);
    }
  }, []);

  // Handle intro animation timing
  useFrame(() => {
    if (!meshRef.current || !materialRef.current || animationComplete) return;

    const elapsed = (Date.now() - startTime) / 1000;

    // Move up animation (first 1 second)
    if (elapsed < 1) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        -viewport.height / 2 - 1,
        0,
        Math.min(1, elapsed)
      );
    }

    // Hold position (1-2 seconds)
    else if (elapsed < 2) {
      meshRef.current.position.y = 0;
    }

    // Dissolve animation (2-3 seconds)
    else if (elapsed < 3) {
      materialRef.current.uniforms.time.value = elapsed - 2; // 0 to 1
    }

    // Animation complete
    else if (elapsed >= 3 && !animationComplete) {
      setAnimationComplete(true);
      onComplete();
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, -viewport.height / 2 - 1, 0]}
    >
      <planeGeometry args={[3, 1.5]} />
      <shaderMaterial
        ref={materialRef}
        transparent={true}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          time: { value: 0 },
          texture1: { value: logoTexture.current },
          color: { value: new THREE.Color("#ffffff") },
        }}
      />
    </mesh>
  );
};
