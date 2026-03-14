// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAg1jVg4owDuNMApXG7tQCietLwCjllVr0",
  authDomain: "ask-field.firebaseapp.com",
  projectId: "ask-field",
  storageBucket: "ask-field.firebasestorage.app",
  messagingSenderId: "981675781921",
  appId: "1:981675781921:web:d93e01a36546dcad855860"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };