import React, { createContext, useState, useEffect } from "react";
import { auth, getUserRole } from "../firebase"; // Import `auth` from firebase.js
import { onAuthStateChanged } from "firebase/auth";

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component to wrap your app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State to store the user object
  const [userRole, setUserRole] = useState(null); // State to store the user role (admin/student)
  const [loading, setLoading] = useState(true); // State to manage the loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const role = await getUserRole(user.uid); // Fetch the user's role
          setUserRole(role); // Set the user's role
        } catch (error) {
          console.error("Failed to fetch user role:", error);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false); // Stop loading after the auth state is resolved
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
