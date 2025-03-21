// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "thai-tale.firebaseapp.com",
  projectId: "thai-tale",
  storageBucket: "thai-tale.firebasestorage.app",
  messagingSenderId: "978691216228",
  appId: "1:978691216228:web:39da0bbd6feac2a69de071",
  measurementId: "G-3M8N73LKV3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Auth with explicit redirect resolver for better mobile support
const auth = getAuth(app);

// Connect to auth emulator in development if VITE_USE_FIREBASE_EMULATOR is set
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR) {
  // Use emulator on localhost:9099
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  console.log("Using Firebase Auth emulator");
}

// Log initialization status
if (import.meta.env.DEV) {
  console.log(
    "Firebase initialized with:",
    "API Key exists:",
    !!import.meta.env.VITE_FIREBASE_API_KEY,
    "Auth Domain:",
    firebaseConfig.authDomain
  );
}

export { app, auth };
