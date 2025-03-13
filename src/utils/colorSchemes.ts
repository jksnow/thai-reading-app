import * as THREE from "three";

// Authentic Balatro color schemes
export const BALATRO_COLOR_SCHEMES = [
  // Red outside blue inside
  // Green scheme
  {
    colorA: new THREE.Color(0.5, 0.1, 0.5), // Dark purple
    colorB: new THREE.Color(0.15, 0.6, 0.18), // Dark green
  },
  {
    colorA: new THREE.Color(0.3, 0.2, 0.05), // Gold
    colorB: new THREE.Color(0.19, 0.4, 0.19), // Forest green
  },
  {
    colorA: new THREE.Color(1, 0.2, 0.2), // RED
    colorB: new THREE.Color(0.05, 0.2, 1), // Secondary (darker blue)
  },

  {
    colorA: new THREE.Color(0.2, 0.2, 0.8), // BLUE
    colorB: new THREE.Color(0.9, 0.2, 0.15), // RED
  },

  // Purple scheme
  {
    colorA: new THREE.Color(0.2, 0.3, 0.05), // Dark gold
    colorB: new THREE.Color(0.8, 0.2, 0.8), // Deep purple
  },

  // Gold/Brown scheme
];
