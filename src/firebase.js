// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Import the authentication service
import { getFirestore } from 'firebase/firestore';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-Bcg9Y49yk3EFQssB-Qm77jsUJj2eSFc",
  authDomain: "managein-6b280.firebaseapp.com",
  projectId: "managein-6b280",
  storageBucket: "managein-6b280.appspot.com",
  messagingSenderId: "952855014428",
  appId: "1:952855014428:web:23e3e66c6a8ae30042c3d9",
  measurementId: "G-8BXDT7NB6X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);
export const db = getFirestore(app);