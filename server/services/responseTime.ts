import { getClient, DEFAULT_DB_NAME } from "../db.js";
import {
  ResponseTime,
  RESPONSE_TIMES_COLLECTION,
} from "../models/responseTime.js";

/**
 * Get the response time data from MongoDB
 * @returns The response time data or default values if not found
 */
export async function getResponseTime(): Promise<ResponseTime> {
  try {
    const client = await getClient();
    const db = client.db(DEFAULT_DB_NAME);
    const collection = db.collection(RESPONSE_TIMES_COLLECTION);

    // Get the single document
    const result = await collection.findOne<ResponseTime>({});

    if (result) {
      return result;
    }

    // If no document exists, create a default one
    const defaultData: ResponseTime = {
      averageTime: 8000,
      samples: 0,
      lastUpdated: new Date().toISOString(),
    };

    await collection.insertOne(defaultData);
    return defaultData;
  } catch (error) {
    console.error("Error getting response time data:", error);
    throw error;
  }
}

/**
 * Update the response time data in MongoDB
 * @param data - The updated response time data
 * @returns The updated response time document
 */
export async function updateResponseTime(
  data: Partial<ResponseTime>
): Promise<ResponseTime> {
  try {
    const client = await getClient();
    const db = client.db(DEFAULT_DB_NAME);
    const collection = db.collection(RESPONSE_TIMES_COLLECTION);

    const updatedData: ResponseTime = {
      averageTime: data.averageTime!,
      samples: data.samples!,
      lastUpdated: new Date().toISOString(),
    };

    // Update the single document or create if it doesn't exist
    await collection.updateOne(
      {}, // empty filter to match any document
      { $set: updatedData },
      { upsert: true }
    );

    return updatedData;
  } catch (error) {
    console.error("Error updating response time data:", error);
    throw error;
  }
}
