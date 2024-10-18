import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase, ref, get, set, remove, onValue, push, update } from "firebase/database"; // Import `remove` from Firebase database
import app from "./services/firebaseConfig";

// Initialize Firebase services
const auth = getAuth(app);
const database = getDatabase(app);

// Set persistence to remember logged-in users across sessions
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set persistence:", error);
});

// Google Auth Provider setup
const googleProvider = new GoogleAuthProvider();

/**
 * Handle Google sign-in
 * @returns {Promise<object>} - Returns the authenticated user or throws an error.
 */
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const email = user.email;

    // Handle Admin Login
    if (email === "coop.onlinestore2024@gmail.com") {
      // Admin login bypasses email domain check
      return user; // Return the admin user without logging them out
    }

    // Handle Student Login (Check if it's a valid university email)
    if (!email.endsWith("@students.isatu.edu.ph")) {
      // If the email is not from the university, log out the user
      await signOut(auth);
      throw new Error("You must use a valid ISAT University email address.");
    }

    return user; // Return the authenticated user (student)
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    throw error;
  }
};

/**
 * Logout the current user
 */
const logout = async () => {
  try {
    await signOut(auth);
    console.log("User successfully logged out");
  } catch (error) {
    console.error("Error during sign-out:", error);
  }
};

/**
 * Get user role from Firebase Realtime Database
 * @param {string} uid - User ID
 * @returns {Promise<string>} - Returns the role (student/admin) or throws an error.
 */
const getUserRole = async (uid) => {
  try {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return snapshot.val().role; // Return the user's role (admin/student)
    } else {
      throw new Error("User role not found");
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    throw error;
  }
};

/**
 * Check if the user already exists in Firebase Realtime Database
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} - Returns true if user exists, false otherwise.
 */
const checkIfUserExists = async (uid) => {
  try {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    return snapshot.exists(); // Returns true if user exists, false otherwise
  } catch (error) {
    console.error("Error checking if user exists:", error);
    throw error;
  }
};

/**
 * Save user data to Firebase Realtime Database
 * @param {string} uid - User ID
 * @param {object} userData - User data to be saved
 * @returns {Promise<void>} - Resolves if the data is saved successfully, throws an error otherwise.
 */
const saveUserData = async (uid, userData) => {
  try {
    const userRef = ref(database, `users/${uid}`);
    await set(userRef, userData); // Save the user data under `users/{uid}` path
    console.log("User data saved successfully");
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

// Export necessary Firebase functions
export { getAuth, auth, signInWithGoogle, logout, getUserRole, checkIfUserExists, saveUserData, database, ref, remove, onValue, push, update };
