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
        // This will only return a result if there was a pending redirect operation
        const result = await getRedirectResult(auth);

        // If we got a result, the user has just signed in via redirect
        if (result && result.user) {
          console.log("Redirect sign-in successful:", result.user.email);
          // Auth state change will be picked up by onAuthStateChanged
        }
      } catch (error) {
        console.error("Error processing redirect result:", error);
      }
    };

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

      // Use different auth methods based on device type
      if (isMobileDevice()) {
        console.log("Using redirect for mobile Google sign-in");
        await signInWithRedirect(auth, provider);
        // The redirect will navigate away from the app
        // Result will be handled in the useEffect with getRedirectResult
      } else {
        console.log("Using popup for desktop Google sign-in");
        await signInWithPopup(auth, provider, browserPopupRedirectResolver);
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
