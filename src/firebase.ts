// Firebase web app config, for "Continue with Google".
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const env = import.meta.env;

/**
 * The project ID used to be read from VITE_GOOGLD_PROJECT_ID (a typo). The correct name is
 * VITE_GOOGLE_PROJECT_ID; the old name still works so existing deployments don't break.
 */
const projectId = env.VITE_GOOGLE_PROJECT_ID || env.VITE_GOOGLD_PROJECT_ID;

const firebaseConfig = {
  apiKey: env.VITE_GOOGLE_API_KEY,
  authDomain: env.VITE_GOOGLE_AUTH_DOMAIN,
  projectId,
  storageBucket: env.VITE_GOOGLE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_GOOGLE_MESSAGING_SENDER_ID,
  appId: env.VITE_GOOGLE_APP_ID,
};

/** The settings Google sign-in can't work without. Shown in the browser console when one is missing. */
export const missingFirebaseSettings = [
  ["VITE_GOOGLE_API_KEY", firebaseConfig.apiKey],
  ["VITE_GOOGLE_AUTH_DOMAIN", firebaseConfig.authDomain],
  ["VITE_GOOGLE_PROJECT_ID", projectId],
  ["VITE_GOOGLE_APP_ID", firebaseConfig.appId],
]
  .filter(([, v]) => !v)
  .map(([k]) => k as string);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { auth, googleProvider };
