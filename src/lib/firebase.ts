import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const env = (import.meta as any).env || {};

// Firebase configuration from build config & env
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDFWHiQz4so0ntZ2xzivpISi5xbo7-KJds",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "ai-studio-applet-webapp-658ea.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "ai-studio-applet-webapp-658ea",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "ai-studio-applet-webapp-658ea.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "71397518161",
  appId: env.VITE_FIREBASE_APP_ID || "1:71397518161:web:8b5d296ead7d4396d84170"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-remixmagicbricks-60e81123-31da-46f5-9938-84b322bc1aab");
export const storage = getStorage(app);
export default app;
