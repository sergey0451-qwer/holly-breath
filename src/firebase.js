import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "missing",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "missing",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "missing",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "missing",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "missing",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "missing",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "missing"
};

let app;
let db;

try {
  if (firebaseConfig.apiKey === "missing") {
    throw new Error("Missing VITE_FIREBASE_API_KEY in Environment Variables!");
  }
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase config error:", error);
  window.__FIREBASE_ERROR__ = error.message;
}

export { db };
