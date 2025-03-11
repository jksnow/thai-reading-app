import { Request, Response } from "express";
import { translateThaiWord, initDictionary } from "../services/dictionary";

/**
 * Translate a Thai word to English
 * @param req - Express request object with word in query params
 * @param res - Express response object
 */
export const translateWord = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { word } = req.query;

  if (!word || typeof word !== "string") {
    res.status(400).json({
      success: false,
      message: "Word parameter is required",
    });
    return;
  }

  try {
    const results = await translateThaiWord(word);
    res.json({
      success: true,
      word,
      translations: results,
    });
  } catch (error) {
    console.error("Error in translation endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Error translating word",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Initialize dictionary when the controller is first loaded
initDictionary().catch((err) => {
  console.error("Failed to initialize dictionary on startup:", err);
});
