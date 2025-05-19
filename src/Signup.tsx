import React, { useState, ChangeEvent } from "react";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  firestore,
  sendEmailVerification,
} from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import TermsPolicy from "./Components/TermsPolicy";
import "bootstrap/dist/css/bootstrap.css";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "/src/Signup.css";
import Header from "../src/Components/Header";
import Nav from "../src/Components/LandingPageNavigation";
import Footer from "../src/Components/Footer.tsx";

interface UserInfo {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const restrictedUsernames = [
  "admin",
  "support",
  "test",
  "user",
  "root",
  "bantot",
  "69",
  "tite",
];

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] =
    useState<boolean>(false);
  const [termsChecked, setTermsChecked] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false); // Add loading state

  // State for user input
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "name") {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

      if (!usernameRegex.test(value) && value !== "") {
        setError(
          "Username must be 3-20 characters and contain only letters, numbers, and underscores."
        );
        return;
      }

      if (restrictedUsernames.includes(value.toLowerCase())) {
        setError(
          "This username is not allowed. Please choose a different one."
        );
        return;
      }

      setError("");
    }

    setUserInfo({ ...userInfo, [name]: value });
  };

  // Handle Sign Up
  // Handle Sign Up
  const handleSignup = async () => {
    setLoading(true); // Set loading to true
    setError(""); // Clear previous errors

    if (
      !userInfo.email ||
      !userInfo.password ||
      !userInfo.name ||
      !userInfo.confirmPassword
    ) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    // Check if passwords match
    if (userInfo.password !== userInfo.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userInfo.email,
        userInfo.password
      );
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Save user data to Firestore, including firstName
      await setDoc(doc(firestore, "users", user.uid), {
        name: userInfo.name.trim(),
        firstName: userInfo.name.trim().split(" ")[0],
        email: userInfo.email,
        emailVerified: false,
        exp: 0,
        createdAt: new Date(),
      });

      alert(
        "Signup successful! A verification email has been sent. Please verify your email address before logging in."
      );
      navigate("/signup"); // Redirect using useNavigate
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "Anonymous",
          firstName: (user.displayName || "Anonymous").split(" ")[0],
          email: user.email || "",
          emailVerified: false,
          exp: 0,
          createdAt: new Date(),
        });
      }
      await sendEmailVerification(user);

      alert(
        "Signup successful! A verification email has been sent. Please verify your email address before logging in."
      );
      navigate("/");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setError("Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Nav />

      <motion.div
        className="d-flex justify-content-center"
        id="bg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="col-md-auto card mt-3 mb-3 pt-4 ps-5 pe-5"
          id="card-bg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2
            id="color-text1"
            className="text-center"
            style={{ fontWeight: 900 }}
          >
            Sign Up
          </h2>
          <motion.span
            id="color-text2"
            className="text-center pb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Create an account to unlock exclusive features
          </motion.span>

          {error && <p className="text-danger text-center">{error}</p>}

          <label className="pt-2 pb-2" style={{ fontWeight: 500 }}>
            Username
          </label>
          <motion.input
            className="rounded p-2 border-0"
            name="name"
            placeholder="Enter your Username"
            value={userInfo.name}
            onChange={handleChange}
          />

          <label className="pt-2 pb-2" style={{ fontWeight: 500 }}>
            Email
          </label>
          <motion.input
            className="rounded p-2 border-0"
            name="email"
            placeholder="Enter your Email"
            value={userInfo.email}
            onChange={handleChange}
          />

          <label className="pt-2 pb-2" style={{ fontWeight: 500 }}>
            Password
          </label>
          <motion.div className="position-relative">
            <input
              className="rounded p-2 border-0 w-100"
              name="password"
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your Password"
              value={userInfo.password}
              onChange={handleChange}
            />
            <motion.button
              type="button"
              className="position-absolute end-0 me-3 mt-1 bg-transparent border-0"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <EyeOff /> : <Eye />}
            </motion.button>
          </motion.div>

          <label className="pt-2 pb-2" style={{ fontWeight: 500 }}>
            Confirm Password
          </label>
          <motion.div className="position-relative">
            <input
              className="rounded p-2 border-0 w-100"
              name="confirmPassword"
              type={confirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm your Password"
              value={userInfo.confirmPassword}
              onChange={handleChange}
            />
            <motion.button
              type="button"
              className="position-absolute end-0 me-3 mt-1 bg-transparent border-0"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              {confirmPasswordVisible ? <EyeOff /> : <Eye />}
            </motion.button>
          </motion.div>

          <motion.label className="p-2" style={{ color: "black" }}>
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
            />
            I agree with{" "}
            <a className="p-1" onClick={() => setShowTerms(true)}>
              Terms of Use
            </a>{" "}
            and{" "}
            <a className="p-1" onClick={() => setShowTerms(true)}>
              Privacy Policy
            </a>
          </motion.label>
          <motion.button
            id="login-btn"
            className="rounded p-2 mt-2 border-0"
            disabled={!termsChecked || loading} // Disable button while loading
            style={{
              cursor: termsChecked ? "pointer" : "not-allowed",
              opacity: termsChecked && !loading ? 1 : 0.6, // Adjust opacity based on loading
            }}
            onClick={handleSignup}
          >
            {loading ? "Signing Up..." : "Sign Up"} {/* Show loading message */}
          </motion.button>

          <div className="line-container mt-3 mb-3">
            <motion.div
              className="line"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6 }}
            ></motion.div>
            <div className="line-container mt-3 mb-3" id="-or-line">
              <motion.div
                className="line"
                id="-line-"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.6 }}
              ></motion.div>
              <span className="text" id="-or-">
                OR
              </span>
              <motion.div
                className="line"
                id="-line-"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.6 }}
              ></motion.div>
            </div>

            <motion.div
              className="line"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6 }}
            ></motion.div>
          </div>

          <motion.button
            className="rounded p-2 border-0"
            onClick={handleGoogleSignIn}
          >
            Sign Up with Google
          </motion.button>
          <div className="p-4"></div>
        </motion.div>
      </motion.div>
      <Footer />
      {showTerms && <TermsPolicy onClose={() => setShowTerms(false)} />}
    </>
  );
};

export default Signup;
