import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, logout, checkIfUserExists } from "../firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const LoginForm = () => {
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  // Check if the user is already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userEmail = user.email.toLowerCase();

        // Admin login check
        if (userEmail === "coop.onlinestore2024@gmail.com") {
          setMessage("Login successful! Redirecting to admin dashboard...");
          setLoading(false);
          navigate("/admin/dashboard");
          return;
        }

        // Check if the user exists in the database
        const userExists = await checkIfUserExists(user.uid);
        if (!userExists) {
          setError("User is not registered.");
          logout();
          setLoading(false);
          return;
        }

        // Redirect students based on email domain
        if (userEmail.endsWith("@students.isatu.edu.ph")) {
          setMessage("Login successful! Redirecting to student browse...");
          setLoading(false);
          navigate("/student/browse");
        } else {
          setError("Invalid email domain. Please use a valid university email.");
          setLoading(false);
          logout();
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  // Handle Email and Password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userEmail = user.email.toLowerCase();

      // Admin login check
      if (userEmail === "coop.onlinestore2024@gmail.com") {
        setMessage("Login successful! Redirecting to admin dashboard...");
        navigate("/admin/dashboard");
        return;
      }

      // Check if the user exists in the database
      const userExists = await checkIfUserExists(user.uid);
      if (!userExists) {
        setError("User is not registered.");
        logout();
        setLoading(false);
        return;
      }

      // Redirect based on email domain
      if (userEmail.endsWith("@students.isatu.edu.ph")) {
        setMessage("Login successful! Redirecting to student browse...");
        navigate("/student/browse");
      } else {
        setError("Invalid email domain. Please use a valid university email.");
        logout();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await signInWithGoogle();
      const userEmail = user.email.toLowerCase();

      // Admin login check
      if (userEmail === "coop.onlinestore2024@gmail.com") {
        setMessage("Login successful! Redirecting to admin dashboard...");
        navigate("/admin/dashboard");
        return;
      }

      // Check if the user exists in the database
      const userExists = await checkIfUserExists(user.uid);
      if (!userExists) {
        setError("User is not registered.");
        logout();
        setLoading(false);
        return;
      }

      // Redirect based on email domain
      if (userEmail.endsWith("@students.isatu.edu.ph")) {
        setMessage("Login successful! Redirecting to student browse...");
        navigate("/student/browse");
      } else {
        setError("Invalid email domain. Please use a valid university email.");
        logout();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-gray-100">
      <div className="flex flex-row justify-start items-center w-[900px] h-[650px] bg-gray-300 rounded-[50px]">

        {/* Left side: Illustration and logo */}
        <div className="w-2/5 h-full flex flex-col justify-center items-center bg-custom-gray rounded-[50px]">
          <div className="flex flex-col justify-center items-center w-full h-[200px]">
            <img src="/people.png" alt="People" className="w-[90%] h-[537px]" />
          </div>
          <div className="flex flex-col justify-center items-center w-full h-[40px]">
            <img src="/coop.png" alt="Coop Online Logo" className="mt-5 w-[90%] h-[250px] object-cover" />
          </div>
        </div>

        {/* Right side: Login form */}
        <div className="w-3/5 h-full flex flex-col items-center bg-gray-300 rounded-[50px]">
          <div className="ml-[80px] mt-[10px] w-[80%] h-[80px] -mb-4">
            <img src="/coop.png" alt="Coop Online" className="w-[80%] h-[80%] object-contain" />
          </div>
          <div className="h-[39px] w-[169px] ml-[20px] mt-10 mb-10">
            <h1 className="text-black opacity-60 font-montserrat font-welcome-font text-welcome-size">WELCOME!</h1>
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center items-center h-[40px] w-[40%] mr-[5px] mt-20">
            <button
              onClick={handleGoogleLogin}
              className="rounded-[24.5px] h-[40px] w-full bg-custom-dark text-white text-sm sm:text-xs md:text-sm lg:text-sm mb-[40px] outline outline-offset-2 outline-green-600"
            >
              LOG IN WITH GOOGLE
            </button>
          </div>

          {error && <div className="text-red-500">{error}</div>}
          {message && <div className="text-green-500">{message}</div>}

          {/* Sign Up Button */}
          <div className="flex justify-center items-center h-[40px] w-[40%] mr-[5px] mt-20">
            <button
              onClick={() => navigate("/register")}
              className="rounded-[24.5px] h-[40px] w-full bg-custom-dark text-white text-sm mb-[40px] outline outline-offset-2 outline-green-600"
            >
              SIGN UP
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginForm;
