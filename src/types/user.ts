export interface UserSettings {
  preferredThemeColorScheme?: string;
  spinRotationSpeed?: number;
  moveSpeed?: number;
  spinAmount?: number;
}

export interface UserCollections {
  modifiers: string[];
  words: string[];
}

export interface UserStats {
  totalReads: number;
  wordsCollected: number;
  modifiersCollected: number;
}

export interface UserTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrentStory {
  selectedModifiers: string[];
  latestResponse?: string;
  promptVersion: number;
}

// Current prompt version - increment this when prompt structure changes
export const CURRENT_PROMPT_VERSION = 1;

export interface User {
  _id: string;
  name: string;
  email: string;
  settings: UserSettings;
  payment: {
    stripeCustomerId?: string;
    hasPremium: boolean;
    subscriptionEndsAt?: Date;
  };
  collections: UserCollections;
  timestamps: UserTimestamps;
  stats: UserStats;
  currentStory?: CurrentStory;
}

// Used when creating a new user
export const createInitialUserData = (
  id: string,
  email: string,
  name: string
): Omit<User, "_id"> => ({
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
  timestamps: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  stats: {
    totalReads: 0,
    wordsCollected: 0,
    modifiersCollected: 0,
  },
});
