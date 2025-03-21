export const createInitialUserData = (email: string, name: string) => ({
  name,
  email,
  collections: {
    modifiers: [],
    words: [],
  },
  settings: {},
  payment: {
    hasPremium: false,
  },
  stats: {
    totalReads: 0,
    wordsCollected: 0,
    modifiersCollected: 0,
  },
});
