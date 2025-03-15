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
} from "firebase/auth";
import { auth } from "../config/firebase";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  settings: {
    preferredThemeColorScheme: string;
  };
  payment: {
    stripeCustomerId?: string;
    hasPremium: boolean;
    subscriptionEndsAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<UserCredential>;
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
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (user: FirebaseUser) => {
    try {
      const response = await axios.get(`/api/users/${user.uid}`);
      setUserData(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const createUserInDB = async (user: FirebaseUser, name: string) => {
    try {
      const newUser = {
        _id: user.uid,
        name,
        email: user.email,
        settings: {
          preferredThemeColorScheme: "Purple & Green",
        },
        payment: {
          hasPremium: false,
        },
      };

      const response = await axios.post("/api/users", newUser);
      setUserData(response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating user in database:", error);
      throw error;
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      console.log("Auth state changed:", user ? "User logged in" : "No user");

      if (user) {
        try {
          // Try to fetch user data from MongoDB
          const existingUser = await fetchUserData(user);

          // If user doesn't exist in MongoDB, create a new user record
          if (!existingUser) {
            // Use the Firebase display name or email as fallback
            const name =
              user.displayName || user.email?.split("@")[0] || "User";
            await createUserInDB(user, name);
          }
        } catch (error) {
          console.error("Error handling user authentication:", error);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await createUserInDB(userCredential.user, name);
    } catch (error) {
      console.error("Error during sign up:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    console.log("Attempting Google sign in");
    const provider = new GoogleAuthProvider();
    // Add scopes if needed
    provider.addScope("email");
    provider.addScope("profile");

    try {
      return await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserData(null);
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
