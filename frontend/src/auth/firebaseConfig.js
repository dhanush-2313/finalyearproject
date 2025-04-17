// firebaseConfig.js
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

// Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "your-firebase-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-firebase-auth-domain",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-firebase-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-firebase-storage-bucket",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "your-firebase-messaging-sender-id",
  appId: process.env.FIREBASE_APP_ID || "your-firebase-app-id",
}
// Initialize Firebase app
const app = initializeApp(firebaseConfig)

// Initialize Firebase Auth
const auth = getAuth(app)

export { auth }

