import { getClient, DEFAULT_DB_NAME } from "../db.js";
import { Translation, TRANSLATIONS_COLLECTION } from "../models/translation.js";
import axios from "axios";

// Ensure index exists for word field
async function ensureIndexes() {
  try {
    const client = await getClient();
    const db = client.db(DEFAULT_DB_NAME);
    const collection = db.collection(TRANSLATIONS_COLLECTION);

    await collection.createIndex({ word: 1 }, { unique: true });
    console.log("MongoDB index on 'word' field ensured");
  } catch (error) {
    console.error("Error ensuring MongoDB indexes:", error);
  }
}

// Call this when the service starts
ensureIndexes();

/**
 * Get a translation from our database
 */
export async function getTranslation(
  word: string
): Promise<Translation | null> {
  try {
    console.log(
      `Attempting to fetch translation for word "${word}" from MongoDB`
    );
    const client = await getClient();
    const db = client.db(DEFAULT_DB_NAME);
    const collection = db.collection(TRANSLATIONS_COLLECTION);

    const result = await collection.findOne<Translation>({ word });
    console.log(
      `MongoDB lookup result for "${word}":`,
      result ? "Found" : "Not found"
    );
    return result;
  } catch (error) {
    console.error("Error getting translation from MongoDB:", error);
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
    console.log(
      `Attempting to store translation for word "${translation.word}" in MongoDB`
    );
    const client = await getClient();
    const db = client.db(DEFAULT_DB_NAME);
    const collection = db.collection(TRANSLATIONS_COLLECTION);

    await collection.insertOne(translation);
    console.log(
      `Successfully stored translation for "${translation.word}" in MongoDB`
    );
    return translation;
  } catch (error) {
    console.error("Error storing translation in MongoDB:", error);
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
    console.log(`Fetching translation for "${word}" from thai2english API`);
    const response = await axios.get(
      `https://www.thai2english.com/api/search?q=${word}`
    );
    const data = response.data;

    if (!data.processed?.firestoreWord) {
      console.log(`No translation found on thai2english for "${word}"`);
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
    console.log(`Successfully fetched and stored translation for "${word}"`);
    return translation;
  } catch (error) {
    console.error("Error fetching translation from thai2english:", error);
    return null;
  }
}
