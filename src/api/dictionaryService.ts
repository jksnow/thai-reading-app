import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Translation result interface
 */
export interface TranslationResult {
  search: string;
  result: string;
  type: string;
  synonym?: string[];
  antonym?: string[];
  relate?: string[];
  define?: string[];
  classifier?: string[];
  sample?: string;
  tag?: string[];
}

// response for type field should be run through an abbreviation filter and return full word
// below is the list of abbreviations and their full words
const typeMap = {
  ABBR: "Abbreviation",
  ADJ: "Adjective",
  ADV: "Adverb",
  AUX: "Auxiliary verb",
  CLAS: "Classifier",
  CONJ: "Conjunction",
  DET: "Determiner",
  IDM: "Idiom",
  INT: "Interjection",
  N: "Noun",
  PHRV: "Pharse verb",
  PREP: "Preposition",
  PRF: "Prefix",
  PRON: "Pronoun",
  SL: "Slang",
  SUF: "Suffix",
  V: "verb",
  VI: "Transitive verb",
  VT: "Intransitive verb",
};

// implement a function that takes the typeMap above and returns the full word
export const abbreviationFilter = (type: string) => {
  if (type === "VI, VT") {
    return "Intransitive and Transitive verb";
  }
  const fullWord = typeMap[type as keyof typeof typeMap];
  return fullWord;
};

/**
 * Translation response interface
 */
interface TranslationResponse {
  success: boolean;
  word: string;
  translations: TranslationResult[];
}

/**
 * Translate a Thai word to English
 * @param word - The Thai word to translate
 * @returns The translation results or empty array if not found
 */
export const translateThaiWord = async (
  word: string
): Promise<TranslationResult[]> => {
  try {
    const response = await axios.get<TranslationResponse>(
      `${API_URL}/translate`,
      {
        params: { word },
      }
    );

    return response.data.success ? response.data.translations : [];
  } catch (error) {
    console.error("Error translating word:", error);
    return [];
  }
};
