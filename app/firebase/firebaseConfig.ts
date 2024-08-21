import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBNOcM72q1oFEU5uD2kUbJsHg8q2lr0br0",
  authDomain: "worthy-ai.firebaseapp.com",
  projectId: "worthy-ai",
  storageBucket: "worthy-ai.appspot.com",
  messagingSenderId: "796095726432",
  appId: "1:796095726432:web:2b57086304f3eda5ab9405",
  measurementId: "G-FGEY8LKMKG"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | undefined;
let googleProvider: GoogleAuthProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();

  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    analytics = getAnalytics(app);
  }

  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { app, auth, db, storage, analytics, googleProvider };