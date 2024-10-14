// src/services/firebaseConfig.js

// Import Firebase SDK
import { initializeApp } from "firebase/app";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIX4yyZjpjnfTfv95B7hMJaS-dFSv6FPs",
  authDomain: "onlineorderingsystem-25863.firebaseapp.com",
  databaseURL: "https://onlineorderingsystem-25863-default-rtdb.firebaseio.com",
  projectId: "onlineorderingsystem-25863",
  storageBucket: "onlineorderingsystem-25863.appspot.com",
  messagingSenderId: "691044662576",
  appId: "1:691044662576:web:347e65e27cd7241d099cf5",
  measurementId: "G-FC8W5SXJD2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the initialized app
export default app;
