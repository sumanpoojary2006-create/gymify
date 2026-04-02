import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

// Replace these with your Firebase project config
// Get these from: https://console.firebase.google.com → Project Settings → General → Your apps → Web app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000",
};

const isConfigured =
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  !firebaseConfig.apiKey.startsWith("YOUR_");

let db = null;

if (isConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  } catch (e) {
    console.warn("Firebase init failed, falling back to localStorage:", e);
  }
}

export function isFirebaseReady() {
  return db !== null;
}

export function saveToFirebase(data) {
  if (!db) return;
  const dbRef = ref(db, "challenge");
  set(dbRef, data).catch((err) => console.error("Firebase save error:", err));
}

export function subscribeToFirebase(callback) {
  if (!db) return () => {};
  const dbRef = ref(db, "challenge");
  const unsubscribe = onValue(
    dbRef,
    (snapshot) => {
      callback(snapshot.val());
    },
    (err) => console.error("Firebase read error:", err)
  );
  return unsubscribe;
}

export default db;
