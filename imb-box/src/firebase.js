// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDgH69_dLIzuxl2Q93Acf7zJVEu4R-NBg",
  authDomain: "imb-box.firebaseapp.com",
  projectId: "imb-box",
  storageBucket: "imb-box.firebasestorage.app",
  messagingSenderId: "9582792377",
  appId: "1:9582792377:web:7b12a281521ee4e5ced568",
  measurementId: "G-4D8C4HFTCE"
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
