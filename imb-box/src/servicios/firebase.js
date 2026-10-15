// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Helper para guardar calificación de una serie en Firestore
 export const saveShowRatingToFirebase = async (userId, showId, data) => {
   try {
     const ref = doc(db, "users", userId, "ratings", String(showId));
     await setDoc(ref, { ...data, updatedAt: Date.now() }, { merge: true });
   } catch (error) {
     console.warn("Guardado en modo local (Firebase no configurado aún):", error.message);
   }
 };

// // Helper para obtener todas las calificaciones del usuario
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
