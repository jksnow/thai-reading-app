import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

interface PendingRequest {
  status: "pending" | "completed" | "error";
  result?: string;
  error?: string;
  timestamp: number;
}

// In-memory store for pending requests
const pendingRequests = new Map<string, PendingRequest>();

// Clean up old requests every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, request] of pendingRequests.entries()) {
    // Remove requests older than 10 minutes
    if (now - request.timestamp > 10 * 60 * 1000) {
      pendingRequests.delete(id);
    }
  }
}, 5 * 60 * 1000);

export const deepseekService = {
  // Start a completion request and return a request ID
  startCompletion: async (prompt: string): Promise<string> => {
    const requestId = Math.random().toString(36).substring(7);

    pendingRequests.set(requestId, {
      status: "pending",
      timestamp: Date.now(),
    });

    // Start the API call in the background
    deepseekService.processCompletion(requestId, prompt);

    return requestId;
  },

  // Get the status and result of a request
  getCompletionStatus: (requestId: string): PendingRequest | null => {
    return pendingRequests.get(requestId) || null;
  },

  // Internal method to process the completion
  processCompletion: async (requestId: string, prompt: string) => {
    try {
      const API_KEY = process.env.DEEPSEEK_API_KEY;
      if (!API_KEY) {
        throw new Error("DEEPSEEK_API_KEY is not set");
      }

      const response = await axios.post(
        "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      const completion = response.data.choices[0]?.message?.content || "";

      pendingRequests.set(requestId, {
        status: "completed",
        result: completion,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      console.error("Error in DeepSeek API call:", error);
      pendingRequests.set(requestId, {
        status: "error",
        error: error.message || "Unknown error",
        timestamp: Date.now(),
      });
    }
  },
};
