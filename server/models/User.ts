import { ObjectId } from "mongodb";
import { getClient, DEFAULT_DB_NAME } from "../db";

export interface User {
  _id: string; // Firebase UID for unique identification
  name: string; // Display name for the user
  email: string; // Email address, synced from Firebase
  settings: {
    preferredThemeColorScheme: string;
  };
  payment: {
    stripeCustomerId?: string; // Stripe customer ID for payment processing
    hasPremium: boolean; // Indicates active premium subscription
    subscriptionEndsAt?: Date; // Date when subscription expires, if applicable
  };
  createdAt: Date; // Timestamp of account creation
  updatedAt: Date; // Timestamp of last update
}

// Collection name
export const USERS_COLLECTION = "users";

// User database operations
export const UserModel = {
  // Get user by Firebase UID
  async findById(userId: string): Promise<User | null> {
    const client = await getClient();
    const db = client.db(DEFAULT_DB_NAME);

    return db.collection<User>(USERS_COLLECTION).findOne({ _id: userId });
  },

  // Create a new user
  async create(userData: Omit<User, "createdAt" | "updatedAt">): Promise<User> {
    const client = await getClient();
    const db = client.db(DEFAULT_DB_NAME);

    const now = new Date();
    const newUser: User = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection<User>(USERS_COLLECTION).insertOne(newUser);
    return newUser;
  },

  // Update user data
  async update(userId: string, userData: Partial<User>): Promise<User | null> {
    const client = await getClient();
    const db = client.db(DEFAULT_DB_NAME);

    const updateData = {
      ...userData,
      updatedAt: new Date(),
    };

    const result = await db
      .collection<User>(USERS_COLLECTION)
      .findOneAndUpdate(
        { _id: userId },
        { $set: updateData },
        { returnDocument: "after" }
      );

    return result || null;
  },

  // Delete a user
  async delete(userId: string): Promise<boolean> {
    const client = await getClient();
    const db = client.db(DEFAULT_DB_NAME);

    const result = await db
      .collection<User>(USERS_COLLECTION)
      .deleteOne({ _id: userId });
    return result.deletedCount === 1;
  },
};

export default UserModel;
