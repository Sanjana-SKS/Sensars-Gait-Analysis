// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQ-_I_sF2RoK7wWH9-m25bk6wtwLeP2Y4",
  authDomain: "sensars-gaitanalysistol.firebaseapp.com",
  projectId: "sensars-gaitanalysistol",
  storageBucket: "sensars-gaitanalysistol.firebasestorage.app",
  messagingSenderId: "267727656305",
  appId: "1:267727656305:web:6e568bcf6b34bb6ce792d0",
  measurementId: "G-F3M2E2JSD2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics , auth};