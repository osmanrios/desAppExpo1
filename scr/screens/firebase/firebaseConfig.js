// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUNYSUcqcLDoNPAB5-VxbFxuy5pJjrLEo",
  authDomain: "wo-fitgestor-x.firebaseapp.com",
  projectId: "wo-fitgestor-x",
  storageBucket: "wo-fitgestor-x.firebasestorage.app",
  messagingSenderId: "964449843202",
  appId: "1:964449843202:web:0bba5d202aa72c91880f1b",
  measurementId: "G-VWSR5Q2Y4T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth y Firestore
export const auth = getAuth(app);
export const db = getFirestore(app); 
export const storage = getStorage(app); // 👈 asegúrate de exportarlo

