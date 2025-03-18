import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Get translation for a Thai word from thai2english.com via our proxy
 */
export const getTranslation = async (word: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/translate/${encodeURIComponent(word)}`
    );
    console.log("Thai2English API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching translation:", error);
    return null;
  }
};
