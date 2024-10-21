import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, checkIfUserExists, saveUserData } from "../firebase"; // Import Firebase functions
import { Icon } from "@iconify/react";

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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center text-custom-gray mb-6">Register with ISATU Details</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-gray"
            required
          />
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-gray"
            required
          />
          <input
            type="text"
            name="program"
            value={userData.program}
            onChange={handleChange}
            placeholder="Program"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-gray"
            required
          />
          <input
            type="text"
            name="section"
            value={userData.section}
            onChange={handleChange}
            placeholder="Section"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-gray"
            required
          />
          <input
            type="text"
            name="studentId"
            value={userData.studentId}
            onChange={handleChange}
            placeholder="Student ID"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-gray"
            required
          />
          <input
            type="text"
            name="year"
            value={userData.year}
            onChange={handleChange}
            placeholder="Year"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-gray"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-custom-gray text-white font-bold py-2 px-4 rounded-md hover:bg-custom-dark transition-colors"
          >
            {loading ? "Registering..." : "Submit and Authenticate with Google"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center justify-center w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
