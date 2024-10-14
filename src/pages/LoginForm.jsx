import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, logout, checkIfUserExists } from "../firebase"; // Import Firebase Google sign-in, logout, and checkIfUserExists functions
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase Auth functions

const LoginForm = () => {
  const [message, setMessage] = useState(null); // State for success or error messages
  const [error, setError] = useState(null); // State for errors
  const [loading, setLoading] = useState(true); // Track loading state
  const [email, setEmail] = useState(""); // Track user email input
  const [password, setPassword] = useState(""); // Track user password input
  const navigate = useNavigate(); // For navigation
  const auth = getAuth(); // Initialize Firebase Auth instance

  // Use effect to check if the user is already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userEmail = user.email.toLowerCase(); // Convert email to lowercase for case-insensitive comparison
        console.log("User logged in:", userEmail);

        // Check if the user is an admin
        if (userEmail === "coop.onlinestore2024@gmail.com") {
          setMessage("Login successful! Redirecting to admin dashboard...");
          setLoading(false); // Stop loading
          navigate("/admin/dashboard"); // Redirect admin to dashboard
          return;
        }

        // Check if the user exists in the Firebase Realtime Database
        const userExists = await checkIfUserExists(user.uid);
        if (!userExists) {
          setError("User is not registered.");
          logout(); // Log out unregistered user
          setLoading(false); // Stop loading
          return;
        }

        // Redirect based on email
        if (userEmail.endsWith("@students.isatu.edu.ph")) {
          setMessage("Login successful! Redirecting to student browse...");
          setLoading(false); // Stop loading
          navigate("/student/browse"); // Redirect student to browse
        } else {
          setError("Invalid email domain. Please use a valid university email.");
          setLoading(false); // Stop loading
          logout(); // Log the user out if email domain is invalid
        }
      } else {
        console.log("No user is logged in");
        setLoading(false); // Stop loading when no user is logged in
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [auth, navigate]);

  // Handle Email and Password login
  const handleEmailLogin = async (e) => {
    e.preventDefault(); // Prevent page refresh
    setLoading(true); // Set loading state
    setError(null); // Reset error state
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userEmail = user.email.toLowerCase(); // Get the user email

      // Check if the user is an admin
      if (userEmail === "coop.onlinestore2024@gmail.com") {
        setMessage("Login successful! Redirecting to admin dashboard...");
        navigate("/admin/dashboard"); // Redirect admin to dashboard
        return;
      }

      // Check if the user exists in the Firebase Realtime Database
      const userExists = await checkIfUserExists(user.uid);
      if (!userExists) {
        setError("User is not registered.");
        logout(); // Log out unregistered user
        setLoading(false); // Stop loading
        return;
      }

      // Redirect based on email
      if (userEmail.endsWith("@students.isatu.edu.ph")) {
        setMessage("Login successful! Redirecting to student browse...");
        navigate("/student/browse"); // Redirect student to browse
      } else {
        setError("Invalid email domain. Please use a valid university email.");
        logout(); // Log the user out if email domain is invalid
      }
    } catch (error) {
      console.error("Error during email login:", error.message); // Log errors for debugging
      setError(error.message); // Set error state to display error message
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Handle Google login button click
  const handleGoogleLogin = async () => {
    setLoading(true); // Set loading state
    setError(null); // Reset error state
    try {
      const user = await signInWithGoogle(); // Sign in using Google
      console.log("Google sign-in success:", user);
      const userEmail = user.email.toLowerCase(); // Convert email to lowercase for comparison

      // Check if the user is an admin
      if (userEmail === "coop.onlinestore2024@gmail.com") {
        setMessage("Login successful! Redirecting to admin dashboard...");
        navigate("/admin/dashboard"); // Redirect admin to dashboard
        return;
      }

      // Check if the user exists in the Firebase Realtime Database
      const userExists = await checkIfUserExists(user.uid);
      if (!userExists) {
        setError("User is not registered.");
        logout(); // Log out unregistered user
        setLoading(false); // Stop loading
        return;
      }

      // Redirect based on email
      if (userEmail.endsWith("@students.isatu.edu.ph")) {
        setMessage("Login successful! Redirecting to student browse...");
        navigate("/student/browse"); // Redirect student to browse
      } else {
        setError("Invalid email domain. Please use a valid university email.");
        logout(); // Log the user out if email domain is invalid
      }
    } catch (error) {
      console.error("Error during Google login:", error.message); // Log errors for debugging
      setError(error.message); // Set error state to display error message
    } finally {
      setLoading(false); // Stop loading
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading state while waiting
  }

  return (
    <div className="login-form">
      <h2>Login with your ISAT University Email</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>} {/* Display success message */}
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
      
      {/* Email and Password Login Form */}
      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login with Email</button>
      </form>

      <p>or</p>

      {/* Google login button */}
      <button onClick={handleGoogleLogin}>Login with Google</button>
      
      {/* Add a button for navigating to the registration page */}
      <p>Don't have an account?</p>
      <button onClick={() => navigate("/register")}>Register</button>
    </div>
  );
};

export default LoginForm;
