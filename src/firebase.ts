import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup, sendEmailVerification } from "firebase/auth";
import { FacebookAuthProvider } from "firebase/auth/web-extension";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWS83pmNe24QVHEzic5NVdEcp6ALMAxAw",
  authDomain: "boost-web-7bdee.firebaseapp.com",
  databaseURL: "https://boost-web-7bdee-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "boost-web-7bdee",
  storageBucket: "boost-web-7bdee.firebasestorage.app",
  messagingSenderId: "505760140190",
  appId: "1:505760140190:web:4ef77d785574cef8e4648f",
  measurementId: "G-10KCBG8PTD"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
export { auth, db, firestore, googleProvider, facebookProvider, createUserWithEmailAndPassword, signInWithPopup, sendEmailVerification, firebaseConfig, app };
