import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pingDatabase, getClient } from "./db";
import { translateWord } from "./controllers/dictionaryController";
import {
  getResponseTimeData,
  updateResponseTimeData,
} from "./controllers/responseTimeController";
import { fileURLToPath } from "url";
import path from "path";

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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

// Thai dictionary translation endpoint
app.get("/api/translate", translateWord);

// Response times API endpoints
app.get("/api/response-times", getResponseTimeData);
app.post("/api/response-times", updateResponseTimeData);

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
