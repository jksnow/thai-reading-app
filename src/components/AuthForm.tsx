import { useState, useEffect } from "react";
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
  const { signInWithGoogle, currentUser } = useAuth();

  // Check if we have a pending redirect
  useEffect(() => {
    // If we find the pending redirect flag in session storage, show loading state
    const pendingRedirect = sessionStorage.getItem("pendingGoogleRedirect");
    if (pendingRedirect === "true") {
      setLoading(true);
      setError({
        message: "Completing your sign-in...",
        isWarning: true,
      });

      // Clear the flag after a timeout if we don't get signed in
      const timeout = setTimeout(() => {
        if (!currentUser) {
          setLoading(false);
          setError({
            message: "Sign-in was not completed. Please try again.",
            isWarning: false,
          });
          sessionStorage.removeItem("pendingGoogleRedirect");
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [currentUser]);

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
      "auth/null-credential": {
        message: "Sign-in was not completed. Please try again.",
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
      // If on mobile, set a flag that we're starting a redirect
      if (isMobileDevice()) {
        sessionStorage.setItem("pendingGoogleRedirect", "true");
        setError({
          message:
            "You're being redirected to Google to sign in. Please complete the process.",
          isWarning: true,
        });
      }

      await signInWithGoogle();

      // If we get here on mobile (unlikely due to redirect), clean up the flag
      if (isMobileDevice()) {
        sessionStorage.removeItem("pendingGoogleRedirect");
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);

      // Remove the pending redirect flag if there's an error
      sessionStorage.removeItem("pendingGoogleRedirect");

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
      // Only set loading to false if we're not in a redirect flow
      // For redirect flow, the loading state will be handled by the useEffect
      if (!isMobileDevice()) {
        setLoading(false);
      }
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
