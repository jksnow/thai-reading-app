import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import thaiTaleLogo from "../assets/v1e.png";
import ButtonOptions from "./ButtonOptions";

// Helper function to detect mobile devices
const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

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

      // On mobile with redirect flow, we should rarely get here since it redirects away
      if (isMobileDevice()) {
        // If we get here on mobile, it might be after returning from redirect
        // But most likely auth is already handled by the redirect result in AuthContext
        console.log("Mobile Google sign-in initiated");
      } else {
        console.log("Google sign-in completed successfully");
      }
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
            errorMessage = isMobileDevice()
              ? "Browser prevented sign-in. Please try again or use a different browser."
              : "Sign-in popup was blocked by your browser. Please allow popups for this site.";
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
          // Mobile-specific errors
          case "auth/redirect-cancelled-by-user":
            errorMessage = "Sign-in was cancelled. Please try again.";
            break;
          case "auth/redirect-operation-pending":
            errorMessage = "A sign-in is already in progress. Please wait.";
            break;
          case "auth/web-storage-unsupported":
            errorMessage =
              "Your browser doesn't support web storage or cookies needed for authentication. Please try a different browser.";
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
      <div className="flex justify-center pb-8">
        <img
          src={thaiTaleLogo}
          alt="Thai Tale Logo"
          className="w-auto"
          style={{ height: "10rem" }}
        />
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">
        Thai Tale - Practice Thai with AI
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
      </div>
    </div>
  );
};

export default AuthForm;
