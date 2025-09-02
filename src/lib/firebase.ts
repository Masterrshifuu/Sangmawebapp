
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  updateCurrentUser,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:demo123',
};

// Stub implementations for when Firebase is not available
const createStub = (name: string) => new Proxy({}, {
  get: () => {
    throw new Error(`Firebase ${name} is not available. Please check your configuration.`);
  }
});

// Initialize Firebase - create stubs during build, real instances in browser
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (typeof window !== 'undefined') {
  // Browser environment
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    app = createStub('app') as FirebaseApp;
    db = createStub('firestore') as Firestore;
    auth = createStub('auth') as Auth;
  }
} else {
  // Server/build environment - use stubs that satisfy TypeScript
  app = createStub('app') as FirebaseApp;
  db = createStub('firestore') as Firestore;
  auth = createStub('auth') as Auth;
}

export { 
    app, 
    db, 
    auth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    updateCurrentUser,
    GoogleAuthProvider,
    signInWithPopup
};
export type { Auth };
