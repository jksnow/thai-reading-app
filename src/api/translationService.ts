import axios from "axios";

interface CacheEntry {
  translation: string;
  timestamp: number;
}

// In-memory cache with expiration time (24 hours)
const translationCache = new Map<string, CacheEntry>();
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Load cached translations from localStorage on initialization
const loadCachedTranslations = () => {
  try {
    const savedCache = localStorage.getItem("translationCache");
    if (savedCache) {
      const parsedCache = JSON.parse(savedCache);
      // Convert to Map and filter out expired entries
      Object.entries(parsedCache).forEach(([key, value]) => {
        const entry = value as CacheEntry;
        if (Date.now() - entry.timestamp < CACHE_EXPIRATION) {
          translationCache.set(key, entry);
        }
      });
    }
  } catch (error) {
    console.error("Error loading translation cache:", error);
  }
};

// Save cache to localStorage
const saveCacheToLocalStorage = () => {
  try {
    // Convert Map to object for storage
    const cacheObject = Object.fromEntries(translationCache.entries());
    localStorage.setItem("translationCache", JSON.stringify(cacheObject));
  } catch (error) {
    console.error("Error saving translation cache:", error);
  }
};

// Initialize by loading cached translations
loadCachedTranslations();

// Translate Thai text to English
const translateText = async (text: string): Promise<string> => {
  // Check if translation is in cache and not expired
  if (translationCache.has(text)) {
    const cachedEntry = translationCache.get(text)!;
    if (Date.now() - cachedEntry.timestamp < CACHE_EXPIRATION) {
      return cachedEntry.translation;
    } else {
      // Remove expired entry
      translationCache.delete(text);
    }
  }

  const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

  if (!API_KEY) {
    throw new Error(
      "Google Translate API key is missing. Please add VITE_GOOGLE_TRANSLATE_API_KEY to your .env file."
    );
  }

  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        q: text,
        source: "th",
        target: "en",
        format: "html",
      }
    );

    const translation = response.data.data.translations[0].translatedText;

    // Cache the result
    translationCache.set(text, {
      translation,
      timestamp: Date.now(),
    });

    // Save to localStorage (debounced in real implementation)
    saveCacheToLocalStorage();

    return translation;
  } catch (error: any) {
    console.error("Translation error:", error);
    throw new Error(`Failed to translate text: ${error.message}`);
  }
};

// LRU cache maintenance - remove oldest entries if cache gets too large
const pruneCache = (maxSize = 500) => {
  if (translationCache.size > maxSize) {
    // Sort entries by timestamp and keep only the newest maxSize entries
    const entries = Array.from(translationCache.entries());
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp);

    translationCache.clear();
    entries.slice(0, maxSize).forEach(([key, value]) => {
      translationCache.set(key, value);
    });

    // Update localStorage
    saveCacheToLocalStorage();
  }
};

// Run cache maintenance periodically
setInterval(() => {
  pruneCache();
}, 60 * 60 * 1000); // Every hour

export default {
  translateText,
};
