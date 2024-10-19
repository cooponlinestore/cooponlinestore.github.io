import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, logout, checkIfUserExists } from "../firebase"; // Import Firebase Google sign-in, logout, and checkIfUserExists functions
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase Auth functions
import "react-icons";


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
    <div className="flex justify-center items-center h-screen w-screen bg-gray-100">  {/* Full screen centering */}
      <div className="flex flex-row justify-start items-center w-[900px] h-[650px] bg-gray-300 rounded-[50px]">  {/* container */}
        <div className="w-2/5 h-full flex flex-col justify-center items-center bg-custom-gray rounded-[50px]">  {/* left side */}
          <div className="flex flex-col justify-center items-center w-full h-[200px]"> {/* container of peopleImg */}
            <img
              src="/people.png" 
              alt="People "
              className="w-[90%] h-[537px]"
            />
          </div>
          <div className="flex flex-col justify-center items-center w-full h-[40px]"> {/* container of coopImgLeft */}
            <img
              src="/coop.png" 
              alt="Coop Online Logo"
              className="mt-5 w-[90%] h-[250px] object-cover"
            />
          </div>
        </div>

        <div className="w-3/5 h-full flex flex-col items-center bg-gray-300 rounded-[50px]">  {/* right side */}
          <div className="ml-[80px] mt-[10px] w-[80%] h-[80px] -mb-4"> {/* container coopImgRight */}
            <img src="/coop.png" alt="a" className="w-[80%] h-[80%] object-contain"></img>
          </div>
          <div className="h-[39px] w-[169px] ml-[20px] mt-10 mb-10"> {/* Container Welcome Text */}
            <h1 className="text-black opacity-60 font-montserrat font-welcome-font text-welcome-size">WELCOME!</h1>
          </div>

          {/* Login Button for Google */}
          <div className="flex justify-center items-center h-[40px] w-[40%] mr-[5px] mt-20">
            <button
              onClick={handleGoogleLogin}
              className="rounded-[24.5px] h-[40px] w-full bg-custom-dark text-white mb-[40px] outline outline-offset-2 outline-green-800"
            >
              LOG IN WITH GOOGLE
            </button>      
          </div>

          {error && <div className="text-red-500">{error}</div>}
          {message && <div className="text-green-500">{message}</div>}

          <div className="flex justify-center items-center h-[40px] w-[40%] mr-[5px] mt-20">
            <button onClick={() => navigate("/register")} className="rounded-[24.5px] h-[40px] w-full bg-custom-dark text-white mb-[40px] outline outline-offset-2 outline-green-600">SIGN UP</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
