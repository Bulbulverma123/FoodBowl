// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY || "AIzaSyBvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQ", // Replace with your actual API key
  authDomain: "foodappfoodbowl.firebaseapp.com",
  projectId: "foodappfoodbowl",
  storageBucket: "foodappfoodbowl.firebasestorage.app",
  messagingSenderId: "39650015781",
  appId: "1:39650015781:web:52a8802fb98f2c5da49dcc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, googleProvider };