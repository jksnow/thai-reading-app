import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// Get the URI and sanitize it
let uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MongoDB URI is not defined in environment variables");
  process.exit(1);
}

// Create a new MongoClient
const client = new MongoClient(uri);

// Variable to track connection status
let isConnected = false;

/**
 * Get the MongoDB client and ensure it's connected
 * @returns Connected MongoDB client
 */
export async function getClient() {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }
  return client;
}

export async function pingDatabase() {
  try {
    // Get the connected client
    const connectedClient = await getClient();

    // Send a ping to confirm a successful connection
    await connectedClient.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
    return { success: true, message: "Successfully connected to MongoDB!" };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return {
      success: false,
      message: "Failed to connect to MongoDB",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Export constants
export const DEFAULT_DB_NAME = "thai-reading-app";

export default client;
