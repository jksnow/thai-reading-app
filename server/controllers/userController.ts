import { Request, Response } from "express";
import UserModel, { User } from "../models/User";

// Get a user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({
      message: "Error retrieving user",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body as Omit<User, "createdAt" | "updatedAt">;

    // Validate required fields
    if (!userData._id || !userData.name || !userData.email) {
      return res
        .status(400)
        .json({ message: "Missing required fields: id, name, or email" });
    }

    // Check if user already exists
    const existingUser = await UserModel.findById(userData._id);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create the user
    const newUser = await UserModel.create(userData);

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Error creating user",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Update a user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body as Partial<User>;

    // Don't allow updating the ID
    if (updateData._id) {
      delete updateData._id;
    }

    const updatedUser = await UserModel.update(id, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Error updating user",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await UserModel.delete(id);

    if (!result) {
      return res
        .status(404)
        .json({ message: "User not found or already deleted" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: "Error deleting user",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
