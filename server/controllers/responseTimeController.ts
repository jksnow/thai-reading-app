import { Request, Response } from "express";
import { getResponseTime, updateResponseTime } from "../services/responseTime";

/**
 * Get the current response time data
 * @param req - Express request object
 * @param res - Express response object
 */
export const getResponseTimeData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = await getResponseTime();
    res.json(data);
  } catch (error) {
    console.error("Error getting response time data:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Update the response time data
 * @param req - Express request object with averageTime and samples in body
 * @param res - Express response object
 */
export const updateResponseTimeData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { averageTime, samples } = req.body;

    if (typeof averageTime !== "number" || typeof samples !== "number") {
      res
        .status(400)
        .json({ message: "averageTime and samples must be numbers" });
      return;
    }

    const updatedData = await updateResponseTime({ averageTime, samples });
    res.json(updatedData);
  } catch (error) {
    console.error("Error updating response time data:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
