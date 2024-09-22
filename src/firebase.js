// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider  } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0lZ9wwSjpZ3tfhdpLWoR49M_QYzq9_Es",
  authDomain: "spendly-your-expense-tracker.firebaseapp.com",
  projectId: "spendly-your-expense-tracker",
  storageBucket: "spendly-your-expense-tracker.appspot.com",
  messagingSenderId: "782898487645",
  appId: "1:782898487645:web:fd63154611bce38180c8b4",
  measurementId: "G-EX5LRBVMJ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { db, auth, provider, doc, setDoc };