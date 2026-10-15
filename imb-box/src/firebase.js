// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, collection } from "firebase/firestore";

// Reemplaza estos valores con los de tu consola de Firebase (Project Settings)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "TU_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tu-proyecto.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tu-proyecto",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tu-proyecto.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000:web:000000"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper para guardar calificación de una serie en Firestore
export const saveShowRatingToFirebase = async (userId, showId, data) => {
  try {
    const ref = doc(db, "users", userId, "ratings", String(showId));
    await setDoc(ref, { ...data, updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    console.warn("Guardado en modo local (Firebase no configurado aún):", error.message);
  }
};

// Helper para obtener todas las calificaciones del usuario
export const fetchUserRatingsFromFirebase = async (userId) => {
  try {
    const querySnapshot = await getDocs(collection(db, "users", userId, "ratings"));
    const results = {};
    querySnapshot.forEach((docSnap) => {
      results[docSnap.id] = docSnap.data();
    });
    return results;
  } catch (error) {
    console.warn("Leyendo desde almacenamiento local:", error.message);
    return null;
  }
};