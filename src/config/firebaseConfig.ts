// src/config/firebaseConfig.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "../serviceKey.json"; 

// Initialize the Firebase Admin app
initializeApp({
    credential: cert(serviceAccount as any), // Using 'as any' to bypass type issues, or define a proper ServiceAccount interface
});

// Get references to the Auth and Firestore services
const auth = getAuth();
const db = getFirestore();

export { auth, db };