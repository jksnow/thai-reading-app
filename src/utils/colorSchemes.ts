import * as THREE from "three";

// Authentic Balatro color schemes
export const BALATRO_COLOR_SCHEMES = [
  // Default Balatro blue scheme
  {
    colorA: new THREE.Color(0.13, 0.13, 0.2), // Primary (dark blue)
    colorB: new THREE.Color(0.05, 0.1, 0.2), // Secondary (darker blue)
  },
  // Red/Orange scheme
  {
    colorA: new THREE.Color(0.4, 0.1, 0.1), // Dark red
    colorB: new THREE.Color(0.3, 0.1, 0.05), // Burgundy
  },
  // Green scheme
  {
    colorA: new THREE.Color(0.05, 0.15, 0.1), // Dark green
    colorB: new THREE.Color(0.1, 0.2, 0.1), // Forest green
  },
  // Purple scheme
  {
    colorA: new THREE.Color(0.2, 0.05, 0.2), // Deep purple
    colorB: new THREE.Color(0.1, 0.05, 0.15), // Dark purple
  },
  // Gold/Brown scheme
  {
    colorA: new THREE.Color(0.3, 0.2, 0.05), // Gold
    colorB: new THREE.Color(0.2, 0.15, 0.05), // Dark gold
  },
];
