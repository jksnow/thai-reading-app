import { getClient, DEFAULT_DB_NAME } from "../db";
import { Translation, TRANSLATIONS_COLLECTION } from "../models/translation";
import axios from "axios";

/**
 * Get a translation from our database
 */
export async function getTranslation(
  word: string
): Promise<Translation | null> {
  try {
    const client = await getClient();
    const db = client.db(DEFAULT_DB_NAME);
    const collection = db.collection(TRANSLATIONS_COLLECTION);

    return await collection.findOne<Translation>({ word });
  } catch (error) {
    console.error("Error getting translation:", error);
    throw error;
  }
}

/**
 * Store a new translation in our database
 */
export async function storeTranslation(
  translation: Translation
): Promise<Translation> {
  try {
    const client = await getClient();
    const db = client.db(DEFAULT_DB_NAME);
    const collection = db.collection(TRANSLATIONS_COLLECTION);

    await collection.insertOne(translation);
    return translation;
  } catch (error) {
    console.error("Error storing translation:", error);
    throw error;
  }
}

/**
 * Fetch translation from thai2english and store in our database
 */
export async function fetchAndStoreTranslation(
  word: string
): Promise<Translation | null> {
  try {
    const response = await axios.get(
      `https://www.thai2english.com/api/search?q=${word}`
    );
    const data = response.data;

    if (!data.processed?.firestoreWord) {
      return null;
    }

    const firestoreWord = data.processed.firestoreWord;
    const translation: Translation = {
      t2e: firestoreWord.t2e,
      word: firestoreWord.word,
      meanings: firestoreWord.meanings.map((m) => ({
        meaning: m.meaning,
        partOfSpeech: m.partOfSpeech,
        displayOrder: m.displayOrder,
      })),
      dateAdded: new Date().toISOString(),
    };

    await storeTranslation(translation);
    return translation;
  } catch (error) {
    console.error("Error fetching translation from thai2english:", error);
    return null;
  }
}
