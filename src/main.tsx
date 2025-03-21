import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// Import Firebase configuration and initialize it explicitly
import { app, auth } from "./config/firebase";

// Register the Firebase Auth service worker for better mobile support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-auth-sw.js")
      .then((registration) => {
        console.log(
          "Firebase Auth Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error(
          "Firebase Auth Service Worker registration failed:",
          error
        );
      });
  });
}

// Log Firebase initialization status
console.log("Firebase app initialized with name:", app.name);
console.log("Firebase auth initialized:", !!auth);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
