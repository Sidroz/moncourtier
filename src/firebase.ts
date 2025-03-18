import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Ajout de Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBJNivR46GFAikF20ymAm7V-TwGLrNp8VI",
  authDomain: "moncourtier-35d12.firebaseapp.com",
  projectId: "moncourtier-35d12",
  storageBucket: "moncourtier-35d12.firebasestorage.app",
  messagingSenderId: "52548623672",
  appId: "1:52548623672:web:62851e3b38645c3368b5cd",
  measurementId: "G-2Y0EW7FF2Y"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Export de Firestore