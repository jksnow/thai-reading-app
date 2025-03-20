import axios from "axios";
import { User, createInitialUserData } from "../types/user";

const API_URL = import.meta.env.VITE_API_URL;

export const userService = {
  /**
   * Create a new user in MongoDB
   */
  async createUser(userId: string, email: string, name: string): Promise<User> {
    try {
      const userData = createInitialUserData(email, name);
      const response = await axios.post(`${API_URL}/users`, {
        _id: userId,
        ...userData,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  /**
   * Update user data in MongoDB
   */
  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    try {
      const response = await axios.patch(`${API_URL}/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  /**
   * Get user by ID from MongoDB
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },
};
