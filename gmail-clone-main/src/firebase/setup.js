import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider} from "firebase/auth"
import {getFirestore} from "firebase/firestore"


const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "fir-auth-9767d.firebaseapp.com",
  projectId: "fir-auth-9767d",
  storageBucket: "fir-auth-9767d.appspot.com",
  messagingSenderId: "203502204012",
  appId: "1:203502204012:web:03e62fa7d219ff0b6a5449"
};



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider(app)
export const database = getFirestore(app)