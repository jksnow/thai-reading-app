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
  AuthError,
} from "firebase/auth";
import { auth } from "../config/firebase";
import axios from "axios";
import { userService } from "../services/userService";
import { User } from "../types/user";

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

// Helper to check if device is mobile
const isMobileDevice = () => {
  return (
    typeof window !== "undefined" &&
    (navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i) ||
      window.innerWidth < 768)
  );
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

  // Verify token and get user data from server
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

  // Process redirect result on component mount
  useEffect(() => {
    async function handleRedirectResult() {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("Redirect sign-in successful");
        }
      } catch (error) {
        console.error("Error processing redirect sign-in:", error);
      } finally {
        setLoading(false);
      }
    }

    handleRedirectResult();
  }, []);

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

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account", // Force account selection
      });

      const isMobile = isMobileDevice();
      console.log(`Using ${isMobile ? "redirect" : "popup"} auth for device`);

      if (isMobile) {
        // Use redirect for mobile devices
        await signInWithRedirect(auth, provider);
        // This will redirect the page, so the code won't continue here
      } else {
        // Try popup for desktop, with fallback to redirect
        try {
          await signInWithPopup(auth, provider);
          console.log("Popup sign-in completed successfully");
        } catch (error) {
          const authError = error as AuthError;
          // If popup blocked or closed, fall back to redirect
          if (
            authError.code === "auth/popup-blocked" ||
            authError.code === "auth/popup-closed-by-user" ||
            authError.code === "auth/cancelled-popup-request"
          ) {
            console.log("Popup was blocked, falling back to redirect");
            await signInWithRedirect(auth, provider);
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
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
