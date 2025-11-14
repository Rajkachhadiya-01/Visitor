// src/firebase.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWQlfBOt8bVNtrFPq1QMhEglW04yQ2KIw",
  authDomain: "gatepass-15b35.firebaseapp.com",
  projectId: "gatepass-15b35",
  storageBucket: "gatepass-15b35.firebasestorage.app",
  messagingSenderId: "136754359619",
  appId: "1:136754359619:web:0a23b3fdf5e3c3acc213f6",
  measurementId: "G-QX4MY946GD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("✅ Firebase initialized successfully");