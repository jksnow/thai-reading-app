import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ButtonOptions from "./ButtonOptions";

const AuthForm = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      console.log("Starting Google sign-in process");
      await signInWithGoogle();
      console.log("Google sign-in completed successfully");
      // Authentication state will be handled by the onAuthStateChanged listener in AuthContext
    } catch (err: any) {
      console.error("Google sign-in error:", err);

      // Format error message for better user understanding
      let errorMessage = "An error occurred during Google authentication";

      if (err.code) {
        switch (err.code) {
          case "auth/popup-closed-by-user":
            errorMessage = "Sign-in was cancelled. Please try again.";
            break;
          case "auth/popup-blocked":
            errorMessage =
              "Sign-in popup was blocked by your browser. Please allow popups for this site.";
            break;
          case "auth/cancelled-popup-request":
            errorMessage = "Sign-in operation was cancelled.";
            break;
          case "auth/network-request-failed":
            errorMessage =
              "Network error. Please check your internet connection.";
            break;
          case "auth/invalid-api-key":
            errorMessage =
              "Authentication service unavailable. Please contact support.";
            break;
          case "auth/operation-not-allowed":
            errorMessage =
              "Google sign-in is not enabled for this project. Please contact the administrator.";
            break;
          case "auth/internal-error":
            errorMessage =
              "Authentication service error. Please ensure Google sign-in is enabled in Firebase console.";
            break;
          case "auth/configuration-not-found":
            errorMessage =
              "Authentication configuration error. Make sure Google sign-in provider is enabled in Firebase.";
            break;
          default:
            errorMessage = `Authentication error: ${err.message || err.code}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black bg-opacity-50 rounded-lg p-6 text-white max-w-md mx-auto mt-10">
      <div className="mx-auto h-24 w-24 overflow-hidden rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-green-500 mb-6">
        <span className="text-white text-4xl font-bold">TT</span>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">
        Welcome to Thai Tale
      </h2>
      <p className="text-center text-sm mb-8 text-gray-300">
        Sign in to access your personalized learning experience
      </p>

      <div className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-md p-3 text-center">
            {error}
          </div>
        )}

        <ButtonOptions
          onClick={handleGoogleSignIn}
          variant="green"
          padding="py-3"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </ButtonOptions>

        <p className="text-center text-sm mt-4 text-gray-300">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
