import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

// Define the shader material type
export type BalatroPaintShaderMaterialImpl = {
  time: number;
  resolution: THREE.Vector2;
  colorA: THREE.Color;
  colorB: THREE.Color;
  colorC: THREE.Color;
  spinRotationSpeed: number;
  moveSpeed: number;
  contrast: number;
  lighting: number;
  spinAmount: number;
  pixelFilter: number;
} & THREE.ShaderMaterial;

export const BalatroPaintShaderMaterial = shaderMaterial(
  // Uniforms
  {
    time: 0,
    resolution: new THREE.Vector2(1, 1),
    colorA: new THREE.Color(0.1, 0.1, 0.1), // Primary color (dark blue in Balatro)
    colorB: new THREE.Color(0.1, 0.1, 0.1), // Secondary color (darker blue in Balatro)
    colorC: new THREE.Color(0.05, 0.05, 0.05), // Background color (very dark in Balatro)
    spinRotationSpeed: 0.3, // 0.3 default
    moveSpeed: 2.0, // 3.0 default
    contrast: 2.5, // 2.5 default
    lighting: 0.4, // 0.4 default
    spinAmount: 0.1, // 0.25 default
    pixelFilter: 1300.0, // 1300.0 default
  },
  // Vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  // Fragment shader - Authentic Balatro background shader
  `
    uniform float time;
    uniform vec2 resolution;
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform vec3 colorC;
    uniform float spinRotationSpeed;
    uniform float moveSpeed;
    uniform float contrast;
    uniform float lighting;
    uniform float spinAmount;
    uniform float pixelFilter;
    
    varying vec2 vUv;
    
    #define SPIN_EASE 1.0
    
    vec4 effect(vec2 screenSize, vec2 screen_coords) {
      // Pixelate the effect
      float pixel_size = length(screenSize.xy) / pixelFilter;
      vec2 uv = (floor(screen_coords.xy*(1./pixel_size))*pixel_size - 0.5*screenSize.xy)/length(screenSize.xy);
      float uv_len = length(uv);
    
      // Calculate spin speed with time
      float speed = (spinRotationSpeed*SPIN_EASE*0.2);
      speed = time * speed;
      speed += 302.2;
      
      // Rotate UVs based on distance from center (creates the swirl)
      float new_pixel_angle = (atan(uv.y, uv.x)) + speed - SPIN_EASE*20.*(1.*spinAmount*uv_len + (1. - 1.*spinAmount));
      vec2 mid = (screenSize.xy/length(screenSize.xy))/2.;
      uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);
    
      // Scale and prepare for the paint patterns
      uv *= 30.;
      speed = time*(moveSpeed);
      vec2 uv2 = vec2(uv.x+uv.y);
    
      // Create the complex swirling patterns using iterative functions
      for(int i=0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv  += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*0.131121), sin(uv2.x - 0.113*speed));
        uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
      }
    
      // Calculate paint effect with rings
      float contrast_mod = (0.25*contrast + 0.5*spinAmount + 1.2);
      float paint_res = min(2., max(0.,length(uv)*(0.035)*contrast_mod));
      float c1p = max(0.,1. - contrast_mod*abs(1.-paint_res));
      float c2p = max(0.,1. - contrast_mod*abs(paint_res));
      float c3p = 1. - min(1., c1p + c2p);
      
      // Add lighting effect
      float light = (lighting - 0.2) * max(c1p*5. - 4., 0.) + lighting * max(c2p*5. - 4., 0.); 
      
      // Blend colors together
      vec4 color1 = vec4(colorA, 1.0);
      vec4 color2 = vec4(colorB, 1.0);
      vec4 color3 = vec4(colorC, 1.0);
      
      vec4 ret_col = (0.3/contrast)*color1 + (1. - 0.3/contrast)*(color1*c1p + color2*c2p + vec4(c3p*color3.rgb, c3p*color1.a)) + light;
      return ret_col;
    }
    
    void main() {
      vec2 screenCoords = vUv * resolution;
      gl_FragColor = effect(resolution, screenCoords);
    }
  `
);

// Extend Three.js with our custom shader material
extend({ BalatroPaintShaderMaterial });

// Add type declaration for the shader material
declare module "@react-three/fiber" {
  interface ThreeElements {
    balatroPaintShaderMaterial: any;
  }
}
