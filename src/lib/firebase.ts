// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace with your Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyC-UQ9s_0-PKKAprgJBaB9ngHlMMtDCaes",
    authDomain: "wall-go-bbb93.firebaseapp.com",
    projectId: "wall-go-bbb93",
    storageBucket: "wall-go-bbb93.firebasestorage.app",
    messagingSenderId: "163903294785",
    appId: "1:163903294785:web:88e79652f1ab084ea165c0"
};

// Initialize Firebase app once
const app = initializeApp(firebaseConfig);

// Get Firestore instance
export const firestore = getFirestore(app);
