import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from 'firebase/database'; // Import Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyCd3P9AfSQW1TL16KW5qmtHl8sE0d7zUaA",
  authDomain: "socialmediaimageapp.firebaseapp.com",
  databaseURL: "https://socialmediaimageapp-default-rtdb.firebaseio.com", // Correct URL for the database
  projectId: "socialmediaimageapp",
  storageBucket: "socialmediaimageapp.firebasestorage.app",
  messagingSenderId: "388257330921",
  appId: "1:388257330921:web:5f082f104149cdf794a278",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);
