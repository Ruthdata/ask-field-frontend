// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  authDomain: import.meta.env.VITE_GOOGLE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_GOOGLD_PROJECT_ID,
  storageBucket: import.meta.env.VITE_GOOGLE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_GOOGLE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_GOOGLE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };