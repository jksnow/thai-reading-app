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
        if (
          redirectInProgress ||
          localStorage.getItem(REDIRECT_IN_PROGRESS_KEY) === "true"
        ) {
          console.log("Detected return from auth redirect");
          localStorage.removeItem(REDIRECT_IN_PROGRESS_KEY);
          setRedirectInProgress(false);

          // First check if we already have a user (in case redirect already completed)
          const currentAuthUser = auth.currentUser;
          if (currentAuthUser) {
            console.log(
              "User already signed in after redirect:",
              currentAuthUser.email
            );
            // Ensure user data is loaded
            await verifyAndGetUserData(currentAuthUser);
            await updateUserData(currentAuthUser);
            return;
          }

          // Otherwise try to get the redirect result
          console.log("Getting redirect result...");
          const result = await getRedirectResult(
            auth,
            browserPopupRedirectResolver
          );

          // If we got a result, the user has just signed in via redirect
          if (result && result.user) {
            console.log("Redirect sign-in successful:", result.user.email);
            // Manually trigger user data fetching to ensure all user data is loaded
            await verifyAndGetUserData(result.user);
            await updateUserData(result.user);
          } else {
            console.log(
              "No redirect result found, but redirect was in progress"
            );
            // Special case: sometimes mobile browsers clear auth state
            // Try to re-initialize auth state through polling
            let attempts = 0;
            const maxAttempts = 5;
            const checkAuthInterval = setInterval(async () => {
              attempts++;
              const user = auth.currentUser;
              if (user) {
                console.log("Found user after polling:", user.email);
                clearInterval(checkAuthInterval);
                await verifyAndGetUserData(user);
                await updateUserData(user);
              } else if (attempts >= maxAttempts) {
                console.log("Failed to find user after polling");
                clearInterval(checkAuthInterval);
              }
            }, 1000);
          }
        } else {
          console.log("No redirect in progress");
        }
      } catch (error) {
        console.error("Error processing redirect result:", error);
        localStorage.removeItem(REDIRECT_IN_PROGRESS_KEY);
        setRedirectInProgress(false);
      }
    };

    // Only run this on initial mount to process any pending redirects
    handleRedirectResult();
  }, [redirectInProgress]);

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
        prompt: "select_account",
      });

      // Choose the appropriate persistence method
      // This ensures auth state is maintained across page redirects
      if (isMobileDevice()) {
        // Set persistence explicitly for mobile to ensure state is preserved through redirects
        await setPersistence(auth, browserLocalPersistence);

        // Mark redirect as in progress in localStorage before navigating away
        localStorage.setItem(REDIRECT_IN_PROGRESS_KEY, "true");
        setRedirectInProgress(true);

        console.log(
          "Using redirect for mobile Google sign-in with local persistence"
        );
        // Pass browserPopupRedirectResolver to ensure redirect works properly on mobile
        await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
        // The redirect will navigate away from the app
        // Result will be handled in the useEffect with getRedirectResult
      } else {
        // For desktop, browserLocalPersistence is usually the default but we'll set it explicitly
        await setPersistence(auth, browserLocalPersistence);
        console.log(
          "Using popup for desktop Google sign-in with local persistence"
        );
        await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      // Clean up if redirect fails
      localStorage.removeItem(REDIRECT_IN_PROGRESS_KEY);
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
