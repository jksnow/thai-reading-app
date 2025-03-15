import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// Import Firebase configuration and initialize it explicitly
import { app, auth } from "./config/firebase";

// Log Firebase initialization status
console.log("Firebase app initialized with name:", app.name);
console.log("Firebase auth initialized:", !!auth);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
