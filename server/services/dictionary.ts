import thaidict from "thaidict";

// Initialize the dictionary
let initialized = false;

/**
 * Initialize the Thai dictionary
 */
export const initDictionary = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (initialized) {
      resolve();
      return;
    }

    try {
      thaidict.init((err: Error | null) => {
        if (err) {
          console.error("Failed to initialize Thai dictionary:", err);
          reject(err);
          return;
        }

        initialized = true;
        console.log("Thai dictionary initialized successfully");
        resolve();
      });
    } catch (error) {
      console.error("Error initializing Thai dictionary:", error);
      reject(error);
    }
  });
};

/**
 * Search for a Thai word translation
 * @param word - The Thai word to translate
 * @returns Translation results or empty array if not found
 */
export const translateThaiWord = (word: string): Promise<any[]> => {
  return new Promise((resolve) => {
    if (!initialized) {
      initDictionary()
        .then(() => {
          const results = thaidict.search(word);
          resolve(results);
        })
        .catch((err) => {
          console.error(
            "Error initializing dictionary during translation:",
            err
          );
          resolve([]);
        });
      return;
    }

    try {
      const results = thaidict.search(word);
      resolve(results);
    } catch (error) {
      console.error("Error searching dictionary:", error);
      resolve([]);
    }
  });
};
