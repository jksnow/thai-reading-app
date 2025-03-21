import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserPopupRedirectResolver,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "../config/firebase";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to detect mobile devices
const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Key for tracking redirect state in local storage
const REDIRECT_IN_PROGRESS_KEY = "firebase_auth_redirect_in_progress";
// Store the redirect start time for better UX handling
const REDIRECT_START_TIME_KEY = "firebase_auth_redirect_start_time";

// Set a timeout for redirect operations (5 minutes)
const REDIRECT_TIMEOUT_MS = 5 * 60 * 1000;

interface UserData {
  displayName?: string;
  email?: string;
  photoURL?: string;
  settings?: {
    spinRotationSpeed?: number;
    moveSpeed?: number;
    spinAmount?: number;
  };
  // Add other user data fields as needed
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectInProgress, setRedirectInProgress] = useState<boolean>(
    localStorage.getItem(REDIRECT_IN_PROGRESS_KEY) === "true"
  );

  // Set up axios interceptor for auth token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(async (config) => {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [currentUser]);

  // Verify token and get user data from server
  const verifyAndGetUserData = async (user: FirebaseUser) => {
    try {
      const token = await user.getIdToken();
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data.userData);
    } catch (error) {
      console.error("Error verifying token:", error);
      await signOut();
    }
  };

  // Update user data on server
  const updateUserData = async (user: FirebaseUser) => {
    try {
      await axios.post(`${API_URL}/auth/user`, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  // Handle redirect result when returning from a redirect auth flow
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        // Check if we're returning from a redirect
        const redirectInProgress =
          localStorage.getItem(REDIRECT_IN_PROGRESS_KEY) === "true";
        const redirectStartTime = localStorage.getItem(REDIRECT_START_TIME_KEY);

        if (redirectInProgress) {
          console.log("Detected return from auth redirect");

          // Check if the redirect has timed out
          if (redirectStartTime) {
            const startTime = parseInt(redirectStartTime, 10);
            const elapsed = Date.now() - startTime;

            if (elapsed > REDIRECT_TIMEOUT_MS) {
              console.warn(
                "Redirect timeout exceeded, cleaning up stale state"
              );
              localStorage.removeItem(REDIRECT_IN_PROGRESS_KEY);
              localStorage.removeItem(REDIRECT_START_TIME_KEY);
              setRedirectInProgress(false);
              return;
            }
          }

          // Clear the redirect flags immediately
          localStorage.removeItem(REDIRECT_IN_PROGRESS_KEY);
          localStorage.removeItem(REDIRECT_START_TIME_KEY);
          setRedirectInProgress(false);

          // First check if we already have a user (redirects sometimes get processed automatically)
          if (auth.currentUser) {
            console.log(
              "User already signed in after redirect:",
              auth.currentUser.email
            );
            await verifyAndGetUserData(auth.currentUser);
            await updateUserData(auth.currentUser);
            return;
          }

          // Otherwise try to get the redirect result
          console.log("Getting redirect result...");
          const result = await getRedirectResult(
            auth,
            browserPopupRedirectResolver
          );

          if (result && result.user) {
            console.log("Redirect sign-in successful:", result.user.email);
            await verifyAndGetUserData(result.user);
            await updateUserData(result.user);
          } else {
            console.log(
              "No redirect result found, but redirect was in progress"
            );
            // Some mobile browsers have problems with maintaining the redirect state
            // Start polling for auth changes as a fallback
            let attempts = 0;
            const maxAttempts = 10; // More attempts with a shorter interval
            const checkAuthInterval = setInterval(async () => {
              attempts++;
              // Force refresh the token to ensure we're getting latest state
              await auth.currentUser?.getIdToken(true).catch(() => null);
              const user = auth.currentUser;

              if (user) {
                console.log("Found user after polling:", user.email);
                clearInterval(checkAuthInterval);
                await verifyAndGetUserData(user);
                await updateUserData(user);
              } else if (attempts >= maxAttempts) {
                console.log("Failed to find user after polling");
                clearInterval(checkAuthInterval);
                // Consider showing a "Sign-in failed" message to the user here
              }
            }, 500); // Shorter polling interval
          }
        }
      } catch (error) {
        console.error("Error processing redirect result:", error);
        localStorage.removeItem(REDIRECT_IN_PROGRESS_KEY);
        localStorage.removeItem(REDIRECT_START_TIME_KEY);
        setRedirectInProgress(false);
      }
    };

    // Process any pending redirects on mount
    handleRedirectResult();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.email);

      if (user) {
        setCurrentUser(user);
        await verifyAndGetUserData(user);
        await updateUserData(user);
      } else {
        setCurrentUser(null);
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await verifyAndGetUserData(userCredential.user);
    } catch (error) {
      console.error("Error during sign up:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();

      // Add scopes to ensure we get email and profile
      provider.addScope("email");
      provider.addScope("profile");

      // Use setCustomParameters to bypass some of the Firebase auth issues
      provider.setCustomParameters({
        // Important: This forces Google to show the account selection dialog
        // which helps with authentication flows, especially on mobile
        prompt: "select_account",
        // Use our proxy setup for redirects on same domain
        auth_domain: window.location.hostname,
      });

      // Ensure we're using local persistence for better auth state survival
      await setPersistence(auth, browserLocalPersistence);

      if (isMobileDevice()) {
        // Mark redirect as in progress in localStorage before navigating away
        localStorage.setItem(REDIRECT_IN_PROGRESS_KEY, "true");
        // Store the current timestamp to detect timeout/stale redirects
        localStorage.setItem(REDIRECT_START_TIME_KEY, Date.now().toString());
        setRedirectInProgress(true);

        console.log(
          "Using redirect for mobile Google sign-in with proxied auth"
        );

        // When using firebase.json proxying or vercel.json rewrites,
        // this redirect should work correctly even with custom domains
        await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
        // The page will navigate away and later return to our app
      } else {
        console.log("Using popup for desktop Google sign-in");
        // On desktop, popup is more reliable
        await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      // Clean up regardless of error type
      localStorage.removeItem(REDIRECT_IN_PROGRESS_KEY);
      localStorage.removeItem(REDIRECT_START_TIME_KEY);
      setRedirectInProgress(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
