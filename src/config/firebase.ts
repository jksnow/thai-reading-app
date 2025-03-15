// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "thai-tale.firebaseapp.com",
  projectId: "thai-tale",
  storageBucket: "thai-tale.firebasestorage.app",
  messagingSenderId: "978691216228",
  appId: "1:978691216228:web:39da0bbd6feac2a69de071",
  measurementId: "G-3M8N73LKV3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
