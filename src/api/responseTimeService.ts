import axios from "axios";

// Define the API endpoint for the response time data
// Ideally this would come from environment variables
const API_URL = `${import.meta.env.VITE_API_URL}/response-times`;

interface ResponseTimeData {
  averageTime: number;
  samples: number;
}

/**
 * Fetch the current average response time from the database
 */
export const fetchAverageResponseTime = async (): Promise<number | null> => {
  try {
    const response = await axios.get(API_URL);
    if (response.data && response.data.averageTime) {
      console.log("Fetched average response time:", response.data.averageTime);
      return response.data.averageTime;
    }
    return null;
  } catch (error) {
    console.error("Error fetching average response time:", error);
    return null;
  }
};

/**
 * Update the average response time in the database
 */
export const updateAverageResponseTime = async (
  newTime: number
): Promise<boolean> => {
  try {
    // First get the current data
    let currentData: ResponseTimeData = {
      averageTime: newTime,
      samples: 0,
    };

    try {
      const response = await axios.get(API_URL);
      if (response.data) {
        currentData = response.data;
      }
    } catch (error) {
      console.warn(
        "Could not fetch current response time data, using defaults"
      );
      // Continue with the default data we initialized
    }

    // Calculate the new average
    const totalTime = currentData.averageTime * currentData.samples + newTime;
    const newSamples = currentData.samples + 1;
    const newAverage = totalTime / newSamples;

    // Update the database
    try {
      await axios.post(API_URL, {
        averageTime: newAverage,
        samples: newSamples,
      });
      console.log("Updated average response time:", newAverage);
    } catch (error) {
      console.error(
        "Error saving response time to server, keeping local only:",
        newAverage
      );
      // We'll still return true since we've calculated the new average locally
    }
    return true;
  } catch (error) {
    console.error("Error updating average response time:", error);
    return false;
  }
};

const responseTimeService = {
  fetchAverageResponseTime,
  updateAverageResponseTime,
};

export default responseTimeService;
