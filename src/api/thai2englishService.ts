import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface Meaning {
  meaning: string;
  partOfSpeech: string;
  displayOrder: number;
}

export interface Translation {
  t2e: string;
  word: string;
  meanings: Meaning[];
  dateAdded: string;
}

/**
 * Get translation for a Thai word from our backend
 */
export const getTranslation = async (
  word: string
): Promise<Translation | null> => {
  try {
    const response = await axios.get<Translation>(
      `${API_URL}/translate/${encodeURIComponent(word)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching translation:", error);
    return null;
  }
};

/**
 * Get transliteration for a Thai word
 */
export const getTransliteration = async (
  word: string
): Promise<string | null> => {
  try {
    const response = await axios.get<{ transliteration: string }>(
      `${API_URL}/transliterate/${encodeURIComponent(word)}`
    );
    return response.data.transliteration;
  } catch (error) {
    console.error("Error fetching transliteration:", error);
    return null;
  }
};
