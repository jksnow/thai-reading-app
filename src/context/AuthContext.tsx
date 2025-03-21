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
} from "firebase/auth";
import { auth } from "../config/firebase";
import axios from "axios";
import { userService } from "../services/userService";
import { User } from "../types/user";
import { isMobileDevice, supportsPopups } from "../utils/deviceDetection";

const API_URL = import.meta.env.VITE_API_URL;

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
      const token = await user.getIdToken();
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.userData) {
        // If user doesn't exist in our database, create them
        const newUser = await userService.createUser(
          user.uid,
          user.email || "",
          user.displayName || user.email || "Anonymous User"
        );
        setUserData(newUser);
      } else {
        setUserData(response.data.userData);
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      await signOut();
    }
  };

  // Handle redirect result when the page loads
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await verifyAndGetUserData(result.user);
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
      }
    };

    handleRedirectResult();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.email);

      if (user) {
        setCurrentUser(user);
        await verifyAndGetUserData(user);
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

  /**
   * Handles Google sign-in using either popup or redirect based on:
   * 1. Device type (mobile vs desktop)
   * 2. Browser popup support
   * 3. Previous failed attempts
   */
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();

      // Add additional scopes if needed
      provider.addScope("profile");
      provider.addScope("email");

      // Set custom parameters for better UX
      provider.setCustomParameters({
        prompt: "select_account", // Always show account selection
      });

      // Determine sign-in method based on device and browser capabilities
      const shouldUseRedirect = isMobileDevice() || !supportsPopups();

      if (shouldUseRedirect) {
        // Use redirect method for mobile devices or when popups might be blocked
        await signInWithRedirect(auth, provider);
        // The redirect result will be handled by the useEffect hook
      } else {
        // Use popup for desktop browsers
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
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
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
