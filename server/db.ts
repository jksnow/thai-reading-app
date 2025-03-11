import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// Get the URI and sanitize it
let uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MongoDB URI is not defined in environment variables");
  process.exit(1);
}

const client = new MongoClient(uri);

export async function pingDatabase() {
  try {
    // Connect to the MongoDB server
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
    return { success: true, message: "Successfully connected to MongoDB!" };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return {
      success: false,
      message: "Failed to connect to MongoDB",
      error: error.message || String(error),
    };
  } finally {
    // Close the connection when done
    await client.close();
  }
}

export default client;
