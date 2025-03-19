import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pingDatabase, getClient } from "./db.js";
import {
  getResponseTimeData,
  updateResponseTimeData,
} from "./controllers/responseTimeController.js";
import { fileURLToPath } from "url";
import path from "path";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import axios from "axios";
import {
  getTranslation,
  fetchAndStoreTranslation,
} from "./services/translationService.js";
import { getTransliteration } from "./services/transliterationService.js";
import stripeRoutes from "./routes/stripeRoutes.js";

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(
  cors({
    origin: [
      "https://thaitale.io",
      "https://www.thaitale.io",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Location"],
  })
);

// Parse JSON payloads
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, "../dist")));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/stripe", stripeRoutes);

// Special route configuration for Stripe webhooks
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Basic health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Response times endpoint
app.get("/api/response-times", getResponseTimeData);
app.post("/api/response-times", updateResponseTimeData);

// Translation endpoints
app.get("/api/translate/:text", async (req, res) => {
  try {
    const translation = await getTranslation(req.params.text);
    res.json(translation);
  } catch (error) {
    res.status(500).json({ error: "Translation failed" });
  }
});

app.post("/api/translate", async (req, res) => {
  try {
    const { text } = req.body;
    const translation = await fetchAndStoreTranslation(text);
    res.json(translation);
  } catch (error) {
    res.status(500).json({ error: "Translation failed" });
  }
});

// Transliteration endpoint
app.get("/api/transliterate/:text", async (req, res) => {
  try {
    const transliteration = await getTransliteration(req.params.text);
    res.json(transliteration);
  } catch (error) {
    res.status(500).json({ error: "Transliteration failed" });
  }
});

// Serve index.html for all other routes (SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Initialize MongoDB connection
async function initMongoDB() {
  try {
    await getClient();
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

// For local development
if (process.env.NODE_ENV !== "production") {
  const startServer = async () => {
    try {
      await initMongoDB();
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  };

  startServer();
}

// Initialize MongoDB connection at the module level for serverless
initMongoDB().catch(console.error);

// Export the Express app for Vercel
export default app;
