// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDocs, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Autenticación de usuarios
 */
export const registerWithEmail = (email, password) => 
  createUserWithEmailAndPassword(auth, email, password);

export const loginWithEmail = (email, password) => 
  signInWithEmailAndPassword(auth, email, password);

export const loginAnonymously = () => 
  signInAnonymously(auth);

export const logoutUser = () => 
  signOut(auth);

/**
 * Sincronización de datos con Firestore Database
 * Ruta en base de datos: users/{userId}/ratings/{showId}
 */
export const saveShowRatingToFirebase = async (userId, showId, data) => {
  if (!userId || !db) return;
  try {
    const ref = doc(db, "users", userId, "ratings", String(showId));
    await setDoc(
      ref, 
      { ...data, updatedAt: Date.now() }, 
      { merge: true }
    );
  } catch (error) {
    console.error("Error guardando en Firestore:", error.message);
  }
};

export const fetchUserRatingsFromFirebase = async (userId) => {
  if (!userId || !db) return null;
  try {
    const querySnapshot = await getDocs(collection(db, "users", userId, "ratings"));
    const results = {};
    querySnapshot.forEach((docSnap) => {
      results[docSnap.id] = docSnap.data();
    });
    return results;
  } catch (error) {
    console.error("Error leyendo de Firestore:", error.message);
    return null;
  }
};