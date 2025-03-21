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
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "../config/firebase";
import axios from "axios";
import { userService } from "../services/userService";
import { User } from "../types/user";
import { isMobileDevice, supportsPopups } from "../utils/deviceDetection";

const API_URL = import.meta.env.VITE_API_URL;

// Flag to track if we've already processed a redirect
let redirectProcessed = false;
// Store the last redirect result
let lastRedirectResult: { user: FirebaseUser } | null = null;

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

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

  /**
   * Handles the verification and retrieval of user data from the server
   * If the user doesn't exist in our database, creates a new user record
   */
  const verifyAndGetUserData = async (user: FirebaseUser) => {
    try {
      console.log("Verifying user data for:", user.email);
      const token = await user.getIdToken();
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.userData) {
        console.log("Creating new user record for:", user.email);
        // If user doesn't exist in our database, create them
        const newUser = await userService.createUser(
          user.uid,
          user.email || "",
          user.displayName || user.email || "Anonymous User"
        );
        setUserData(newUser);
      } else {
        console.log("Using existing user data for:", user.email);
        setUserData(response.data.userData);
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      await signOut();
    }
  };

  // Process redirect result and initialize auth state
  useEffect(() => {
    async function initializeAuth() {
      setInitializing(true);

      try {
        // Set persistence to LOCAL to ensure the user stays signed in
        await setPersistence(auth, browserLocalPersistence);

        // Handle redirect result if not already processed
        if (!redirectProcessed) {
          redirectProcessed = true;
          console.log("Checking for redirect result...");

          try {
            const result = await getRedirectResult(auth);
            lastRedirectResult = result;

            if (result && result.user) {
              console.log(
                "Successfully signed in via redirect:",
                result.user.email
              );
              setCurrentUser(result.user);
              await verifyAndGetUserData(result.user);
            } else {
              console.log("No redirect result found or already processed");
            }
          } catch (redirectError: any) {
            console.error("Error processing redirect result:", redirectError);
            // Specific error handling for redirect errors
            if (redirectError.code === "auth/null-credential") {
              console.log(
                "Null credential error - likely user canceled auth or token expired"
              );
            }
          }
        }

        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log("Auth state changed:", user?.email);

          if (user) {
            setCurrentUser(user);
            // Only verify user data if we haven't just processed a redirect
            // This prevents duplicate verification
            if (
              !lastRedirectResult ||
              !lastRedirectResult.user ||
              lastRedirectResult.user.uid !== user.uid
            ) {
              await verifyAndGetUserData(user);
            }
          } else {
            setCurrentUser(null);
            setUserData(null);
          }

          setLoading(false);
          setInitializing(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
        setInitializing(false);
        return () => {};
      }
    }

    const cleanup = initializeAuth();
    return () => {
      cleanup.then((unsubscribe) => unsubscribe());
    };
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

  /**
   * Handles Google sign-in using either popup or redirect based on:
   * 1. Device type (mobile vs desktop)
   * 2. Browser popup support
   * 3. Previous failed attempts
   */
  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google sign-in process");
      const provider = new GoogleAuthProvider();

      // Add additional scopes if needed
      provider.addScope("profile");
      provider.addScope("email");

      // Set custom parameters for better UX
      provider.setCustomParameters({
        prompt: "select_account", // Always show account selection
      });

      // Ensure we're using local persistence before sign-in
      await setPersistence(auth, browserLocalPersistence);

      // Force redirect on mobile
      const isMobile = isMobileDevice();
      console.log("Is mobile device:", isMobile);
      const canUsePopup = !isMobile && supportsPopups();
      console.log("Can use popup:", canUsePopup);

      if (!canUsePopup) {
        // Reset the redirect processed flag
        redirectProcessed = false;
        console.log("Using redirect sign-in method");
        await signInWithRedirect(auth, provider);
        // The redirect result will be handled when the page loads again
      } else {
        console.log("Using popup sign-in method");
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          console.log("Popup sign-in successful for:", result.user.email);
          await verifyAndGetUserData(result.user);
        }
      }
    } catch (error: any) {
      console.error("Error signing in with Google:", error);

      // If popup fails, try redirect as fallback
      if (
        error.code === "auth/popup-blocked" ||
        error.code === "auth/popup-closed-by-user"
      ) {
        try {
          redirectProcessed = false;
          console.log("Popup failed, falling back to redirect");
          await signInWithRedirect(auth, new GoogleAuthProvider());
        } catch (redirectError) {
          console.error("Error during redirect sign-in:", redirectError);
          throw redirectError;
        }
      } else {
        throw error;
      }
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
    loading: loading || initializing,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
