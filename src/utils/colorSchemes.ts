import * as THREE from "three";

// Authentic Balatro color schemes
export const BALATRO_COLOR_SCHEMES = [
  // Red outside blue inside
  {
    colorA: new THREE.Color(0.4, 0.1, 0.1), // RED
    colorB: new THREE.Color(0.05, 0.1, 0.23), // Secondary (darker blue)
  },

  {
    colorA: new THREE.Color(0.13, 0.13, 0.3), // BLUE
    colorB: new THREE.Color(0.35, 0.1, 0.05), // RED
  },

  // Green scheme
  {
    colorA: new THREE.Color(0.21, 0.05, 0.24), // Dark purple
    colorB: new THREE.Color(0.05, 0.25, 0.1), // Dark green
  },
  // Purple scheme
  {
    colorA: new THREE.Color(0.2, 0.3, 0.05), // Dark gold
    colorB: new THREE.Color(0.25, 0.05, 0.25), // Deep purple
  },

  // Gold/Brown scheme
  {
    colorA: new THREE.Color(0.3, 0.2, 0.05), // Gold
    colorB: new THREE.Color(0.19, 0.29, 0.19), // Forest green
  },
];
