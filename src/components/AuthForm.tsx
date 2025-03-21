import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import thaiTaleLogo from "../assets/v1e.png";
import ButtonOptions from "./ButtonOptions";
import { isMobileDevice } from "../utils/deviceDetection";

interface AuthError {
  message: string;
  isWarning?: boolean; // For non-critical errors that don't prevent sign-in
}

const AuthForm = () => {
  const [error, setError] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  /**
   * Maps Firebase auth error codes to user-friendly messages
   * @param code Firebase auth error code
   * @param message Original error message
   * @returns Formatted error message and severity
   */
  const getErrorMessage = (code: string, message: string): AuthError => {
    const errorMap: { [key: string]: AuthError } = {
      "auth/popup-closed-by-user": {
        message: "Sign-in was cancelled. Please try again.",
        isWarning: true,
      },
      "auth/popup-blocked": {
        message:
          "Sign-in popup was blocked. We'll try a different method automatically.",
        isWarning: true,
      },
      "auth/cancelled-popup-request": {
        message: "Sign-in was cancelled. Please try again.",
        isWarning: true,
      },
      "auth/network-request-failed": {
        message:
          "Network error. Please check your internet connection and try again.",
      },
      "auth/invalid-api-key": {
        message: "Authentication service unavailable. Please contact support.",
      },
      "auth/operation-not-allowed": {
        message:
          "Google sign-in is not enabled for this project. Please contact the administrator.",
      },
      "auth/internal-error": {
        message:
          "Authentication service error. Please try again in a few moments.",
      },
      "auth/configuration-not-found": {
        message:
          "Authentication configuration error. Please contact the administrator.",
      },
      "auth/timeout": {
        message: "The request timed out. Please try again.",
      },
      "auth/web-storage-unsupported": {
        message:
          "Sign-in requires browser storage to be enabled. Please enable cookies and try again.",
      },
    };

    return (
      errorMap[code] || {
        message: message || "An unexpected error occurred. Please try again.",
      }
    );
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      // Show a message for mobile users about the redirect
      if (isMobileDevice()) {
        setError({
          message: "You'll be redirected to Google to sign in...",
          isWarning: true,
        });
      }

      await signInWithGoogle();
    } catch (err: any) {
      console.error("Google sign-in error:", err);

      // Handle specific error cases
      if (err.code) {
        setError(getErrorMessage(err.code, err.message));
      } else if (err.message) {
        setError({ message: err.message });
      } else {
        setError({
          message: "An unexpected error occurred. Please try again.",
        });
      }
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
          <div
            className={`${
              error.isWarning
                ? "bg-yellow-500 bg-opacity-20 border-yellow-500"
                : "bg-red-500 bg-opacity-20 border-red-500"
            } border rounded-md p-3 text-center`}
          >
            {error.message}
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
