import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useLocation } from 'react-router-dom';
import Navbar from "../Components/Nav";
import Footer from "../Components/Footer";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { serverUrl } from "../App";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const location = useLocation();
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));
      navigate("/");
    } catch (error) {
      console.error("Signin Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Signin failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google Auth Result:", result);
      
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        { 
          fullName: result.user.displayName, 
          email: result.user.email, 
          role: 'user' 
        },
        { withCredentials: true }
      );
      
      console.log("Backend Response:", data);
      dispatch(setUserData(data));
      navigate("/");
      
    } catch (error) {
      console.error("Google sign-in error:", error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Google sign-in was cancelled. Please try again.");
      } else if (error.code === 'auth/popup-blocked') {
        setError("Popup was blocked by browser. Please allow popups and try again.");
      } else if (error.code === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(error.response?.data?.message || "Google sign-in failed! Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar/>
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="card p-4 shadow"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h3 className="text-center mb-4">Sign in</h3>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="fa-solid fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignIn}>
          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          {/* Forgot password link */}
          <div
            onClick={() => navigate("/forgot-password")}
            style={{ cursor: "pointer", color: "green" }}
          >
            Forgot password
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-success w-100 mt-3" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>

          {/* Google Sign In */}
          <button
            type="button"
            className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2 mt-3"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing in with Google...
              </>
            ) : (
              <>
                <img
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  alt="Google"
                  style={{ width: "20px", height: "20px" }}
                />
                Sign in with Google
              </>
            )}
          </button>

          {/* Switch to signup */}
          <p className="mt-3 d-flex align-items-center gap-2">
            Want to create a new account?
            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={() => navigate("/signup")}
            >
              Signup
            </button>
          </p>
        </form>
      </div>
    </div>
    <div><Footer/></div>
    </div>
  );
};

export default Signin;
