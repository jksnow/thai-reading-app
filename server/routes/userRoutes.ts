import express from "express";
import {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";

const router = express.Router();

// Get user by ID
router.get("/:id", getUserById);

// Create a new user
router.post("/", createUser);

// Update a user - support both PUT and PATCH for full/partial updates
router.put("/:id", updateUser);
router.patch("/:id", updateUser);

// Delete a user
router.delete("/:id", deleteUser);

export default router;
