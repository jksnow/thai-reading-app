import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pingDatabase } from "./db";
import { translateWord } from "./controllers/dictionaryController";

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);

  // Test database connection on startup
  pingDatabase()
    .then((result) => {
      if (!result.success) {
        console.warn("Warning: MongoDB connection test failed on startup");
      }
    })
    .catch((err) => {
      console.error("Error testing MongoDB connection on startup:", err);
    });
});
