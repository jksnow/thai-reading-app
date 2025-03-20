import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pingDatabase, getClient } from "./db.js";
import {
  getResponseTimeData,
  updateResponseTimeData,
} from "./controllers/responseTimeController.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import axios from "axios";
import {
  getTranslation,
  fetchAndStoreTranslation,
} from "./services/translationService.js";
import { getTransliteration } from "./services/transliterationService.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import { deepseekService } from "./services/deepseekService.js";
import authRoutes from "./routes/authRoutes.js";
import { romanize } from "../src/utils/romanize";

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
      "http://127.0.0.1:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// Parse JSON payloads
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(join(__dirname, "../dist")));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/auth", authRoutes);

// Special route configuration for Stripe webhooks
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Basic health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Response times endpoint
app.get("/api/response-times", getResponseTimeData);
app.post("/api/response-times", updateResponseTimeData);

// Translation endpoints
app.get("/api/translate/:text", async (req: Request, res: Response) => {
  try {
    // First try to get from MongoDB
    let translation = await getTranslation(req.params.text);

    // If not found in MongoDB, fetch from thai2english and store
    if (!translation) {
      translation = await fetchAndStoreTranslation(req.params.text);
    }

    res.json(translation);
  } catch (error) {
    console.error("Error in translation endpoint:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

app.post("/api/translate", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const translation = await fetchAndStoreTranslation(text);
    res.json(translation);
  } catch (error) {
    res.status(500).json({ error: "Translation failed" });
  }
});

// Transliteration endpoint
app.get("/api/transliterate/:text", (req, res) => {
  try {
    const text = decodeURIComponent(req.params.text);
    const transliteration = romanize(text);
    res.json({ transliteration });
  } catch (error) {
    console.error("Error transliterating text:", error);
    res.status(500).json({ error: "Failed to transliterate text" });
  }
});

// DeepSeek completion endpoint
app.post("/api/deepseek/completion", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const requestId = await deepseekService.startCompletion(prompt);
    res.json({ requestId });
  } catch (error) {
    console.error("Error starting completion:", error);
    res.status(500).json({ error: "Failed to start completion" });
  }
});

// DeepSeek completion status endpoint
app.get(
  "/api/deepseek/completion/:requestId",
  (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;
      const status = deepseekService.getCompletionStatus(requestId);

      if (!status) {
        res.status(404).json({ error: "Request not found" });
        return;
      }

      res.json(status);
    } catch (error) {
      console.error("Error getting completion status:", error);
      res.status(500).json({ error: "Failed to get completion status" });
    }
  }
);

// Serve index.html for all other routes (SPA support)
app.get("*", (_req: Request, res: Response) => {
  res.sendFile(join(__dirname, "../dist/index.html"));
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
