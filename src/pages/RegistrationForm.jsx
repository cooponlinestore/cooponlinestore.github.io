import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, checkIfUserExists, saveUserData } from "../firebase"; // Import Firebase functions

const RegistrationForm = () => {
  const [userData, setUserData] = useState({
    name: "",
    password: "",
    program: "",
    section: "",
    studentId: "",
    year: ""
  });
  const [error, setError] = useState(""); // State for errors
  const [success, setSuccess] = useState(""); // State for success message
  const [loading, setLoading] = useState(false); // Loading state
  const [googleUser, setGoogleUser] = useState(null); // Store the authenticated Google user
  const navigate = useNavigate(); // For navigation

  // Handle input changes for the form
  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  // Step 1: Validate form before triggering Google authentication
  const validateForm = () => {
    const { name, password, program, section, studentId, year } = userData;
    if (!name || !password || !program || !section || !studentId || !year) {
      setError("Please complete all the required fields.");
      return false;
    }
    return true;
  };

  // Step 2: Trigger Google Authentication after the form is validated
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    
    try {
      const user = await signInWithGoogle(); // Authenticate user with Google
      setGoogleUser(user); // Store the authenticated user
      return user; // Return the authenticated user for further processing
    } catch (error) {
      setError("Google authentication failed: " + error.message);
      setLoading(false);
      return null;
    }
  };

  // Step 3: Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Validate the form first
    if (!validateForm()) {
      return; // Stop the process if the form is invalid
    }

    // Trigger Google Sign-In after form is validated
    const user = await handleGoogleSignIn();
    if (!user) return; // If Google sign-in fails, stop further processing

    const userId = user.uid; // Get the authenticated user's UID

    // Check if the user already exists in the Firebase database
    const userExists = await checkIfUserExists(userId);
    if (userExists) {
      setError("User already exists with this Google account.");
      setLoading(false);
      return; // Stop if the user already exists
    }

    // Step 4: Prepare data to be saved
    const fullUserData = {
      ...userData, // Form data
      email: user.email, // Email from Google
      role: "student", // Default role for the user
    };

    // Step 5: Save the full user data in Firebase Realtime Database
    try {
      await saveUserData(userId, fullUserData);
      setSuccess("Registration successful!"); // Show success message
      setLoading(false); // Stop loading
      navigate("/student/browse"); // Redirect the user to the student dashboard
    } catch (error) {
      setError("Failed to save user data: " + error.message); // Handle save errors
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Regsr with your ISAT University Details</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={userData.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          type="password"
          name="password"
          value={userData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <input
          type="text"
          name="program"
          value={userData.program}
          onChange={handleChange}
          placeholder="Program"
          required
        />
        <input
          type="text"
          name="section"
          value={userData.section}
          onChange={handleChange}
          placeholder="Section"
          required
        />
        <input
          type="text"
          name="studentId"
          value={userData.studentId}
          onChange={handleChange}
          placeholder="Student ID"
          required
        />
        <input
          type="text"
          name="year"
          value={userData.year}
          onChange={handleChange}
          placeholder="Year"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Submit and Authenticate with Google"}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
