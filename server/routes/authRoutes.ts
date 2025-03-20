import express from "express";
import { auth } from "../config/firebase-admin.js";
import { getClient, DEFAULT_DB_NAME } from "../db.js";

const router = express.Router();

// Middleware to verify Firebase ID token
export const verifyToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Verify token and return user data
router.get("/verify", verifyToken, async (req: any, res) => {
  try {
    // Get user data from MongoDB if needed
    const client = await getClient();
    const db = client.db(DEFAULT_DB_NAME);
    const userData = await db
      .collection("users")
      .findOne({ uid: req.user.uid });

    res.json({
      user: req.user,
      userData: userData || null,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create or update user data
router.post("/user", verifyToken, async (req: any, res) => {
  try {
    const { displayName, email, photoURL } = req.body;
    const client = await getClient();
    const db = client.db(DEFAULT_DB_NAME);

    await db.collection("users").updateOne(
      { uid: req.user.uid },
      {
        $set: {
          displayName,
          email,
          photoURL,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
