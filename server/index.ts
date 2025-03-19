import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pingDatabase, getClient } from "./db";
import {
  getResponseTimeData,
  updateResponseTimeData,
} from "./controllers/responseTimeController";
import { fileURLToPath } from "url";
import path from "path";
import paymentRoutes from "./routes/paymentRoutes";
import userRoutes from "./routes/userRoutes";
import axios from "axios";
import {
  getTranslation,
  fetchAndStoreTranslation,
} from "./services/translationService";
import { getTransliteration } from "./services/transliterationService";

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Log Stripe environment variables to ensure they're loaded
// (Remove in production)
console.log(
  "Stripe Secret Key available:",
  !!process.env.VITE_STRIPE_SECRET_KEY
);
console.log(
  "Stripe Publishable Key available:",
  !!process.env.VITE_STRIPE_PUBLISHABLE_KEY
);

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// MongoDB connection test endpoint
app.get("/api/db-ping", async (req, res) => {
  try {
    const result = await pingDatabase();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error pinging database",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Thai2English proxy endpoint with database caching
app.get("/api/translate/:word", async (req, res) => {
  try {
    const { word } = req.params;

    // First try to get from our database
    let translation = await getTranslation(word);

    // If not found, fetch from thai2english and store
    if (!translation) {
      translation = await fetchAndStoreTranslation(word);
    }

    if (!translation) {
      res.status(404).json({ error: "Translation not found" });
      return;
    }

    // Get transliteration on-the-fly
    const transliteration = await getTransliteration(word);
    if (transliteration) {
      translation = { ...translation, transliteration };
    }

    res.json(translation);
  } catch (error) {
    console.error("Error handling translation request:", error);
    res.status(500).json({ error: "Failed to fetch translation" });
  }
});

// Response times API endpoints
app.get("/api/response-times", getResponseTimeData);
app.post("/api/response-times", updateResponseTimeData);

// User routes
app.use("/api/users", userRoutes);

// Payment routes
app.use("/api/payments", paymentRoutes);

// Special route configuration for Stripe webhooks
// This must come after the express.json() middleware but only for non-webhook routes
// For webhook routes, we need the raw body
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Initialize MongoDB connection and start server
async function startServer() {
  try {
    // Connect to MongoDB at startup
    await getClient();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
