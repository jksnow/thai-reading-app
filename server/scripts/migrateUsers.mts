import { getClient, DEFAULT_DB_NAME } from "../db.js";
import { ObjectId, Document, Collection } from "mongodb";
import { User } from "../models/User.js";
import { createInitialUserData } from "../utils/userUtils.js";

interface UserSettings {
  preferredThemeColorScheme?: string;
}

interface UserCollections {
  modifiers: string[];
  words: string[];
}

interface UserStats {
  totalReads: number;
  wordsCollected: number;
  modifiersCollected: number;
}

interface BaseUser {
  uid?: string;
  displayName?: string;
  name: string;
  email: string;
  collections?: UserCollections;
  settings?: UserSettings;
  payment: {
    stripeCustomerId?: string;
    hasPremium: boolean;
    subscriptionEndsAt?: Date;
  };
  stats?: UserStats;
  createdAt: Date;
  updatedAt: Date;
}

interface UserDocument extends BaseUser {
  _id: string | ObjectId;
}

async function migrateUsers(): Promise<void> {
  const client = await getClient();
  const db = client.db(DEFAULT_DB_NAME);
  const usersCollection = db.collection("users") as Collection<UserDocument>;

  try {
    // Get all users
    const users = await usersCollection.find({}).toArray();
    console.log(`Found ${users.length} total user records`);

    // Group users by their Firebase UID
    const userGroups = users.reduce(
      (acc: { [key: string]: UserDocument[] }, user) => {
        const uid = user.uid || user._id.toString();
        if (!acc[uid]) {
          acc[uid] = [];
        }
        acc[uid].push(user);
        return acc;
      },
      {}
    );

    // Process each group of users
    for (const [uid, userGroup] of Object.entries(userGroups)) {
      if (userGroup.length > 1) {
        console.log(`Found ${userGroup.length} records for user ${uid}`);

        // Find the most complete user record
        const fullUser = userGroup.find(
          (u) => u.collections && u.settings && u.stats
        );
        const minimalUser = userGroup.find(
          (u) => !u.collections && !u.settings && !u.stats
        );

        if (fullUser) {
          console.log(`Found full user record for ${uid}`);

          // Delete the minimal record if it exists
          if (minimalUser) {
            await usersCollection.deleteOne({
              _id: new ObjectId(minimalUser._id.toString()),
            });
            console.log(`Deleted minimal record for ${uid}`);
          }
        } else {
          console.log(`No full record found for ${uid}, creating one`);

          // Use the minimal record to create a full record
          const baseUser = minimalUser || userGroup[0];
          if (!baseUser.email) {
            console.error(`No email found for user ${uid}, skipping`);
            continue;
          }

          const fullUserData = createInitialUserData(
            baseUser.email,
            baseUser.displayName || baseUser.email
          );

          // Create new user with full schema
          const newFullUser: BaseUser = {
            ...fullUserData,
            uid,
            createdAt: baseUser.createdAt || new Date(),
            updatedAt: new Date(),
          };

          await usersCollection.insertOne(newFullUser as UserDocument);
          console.log(`Created full record for ${uid}`);

          // Delete all old records
          await usersCollection.deleteMany({
            $or: userGroup.map((u) => ({
              _id: new ObjectId(u._id.toString()),
            })),
          });
          console.log(`Deleted ${userGroup.length} old records for ${uid}`);
        }
      } else {
        // Single user record - check if it needs to be updated to full schema
        const user = userGroup[0];
        if (!user.collections || !user.settings || !user.stats) {
          console.log(`Updating single record for ${uid} to full schema`);

          if (!user.email) {
            console.error(`No email found for user ${uid}, skipping`);
            continue;
          }

          const fullUserData = createInitialUserData(
            user.email,
            user.displayName || user.email
          );

          await usersCollection.updateOne(
            { _id: new ObjectId(user._id.toString()) },
            {
              $set: {
                ...fullUserData,
                updatedAt: new Date(),
              },
            }
          );
          console.log(`Updated record for ${uid} to full schema`);
        }
      }
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await client.close();
  }
}

// Run the migration
migrateUsers().catch(console.error);
