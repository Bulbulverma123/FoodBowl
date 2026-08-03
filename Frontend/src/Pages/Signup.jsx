import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";
import { serverUrl } from "../App";

const Signup = () => {
  const [role, setRole] = useState("user");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { fullName, email, password, mobile, role },
        { withCredentials: true }
      );
      console.log("Signup Success:", result.data);
      dispatch(setUserData(result.data));
      
      if (role === "owner") {
        navigate("/owner-dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Signup Error:", error.response?.data || error.message);
      setErr(error.response?.data?.message || "Signup failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleAuth = async () => {
    if (!mobile) {
      setErr("Mobile number is required for Google Sign-Up.");
      return;
    }

    setLoading(true);
    setErr("");
    
    try {     
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google Auth Result:", result);
      
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          mobile,
          role,
        },
        { withCredentials: true }
      );
      
      console.log("Google Sign-Up Success:", data);
      dispatch(setUserData(data));
      
      if (role === "owner") {
        navigate("/owner-dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Google Sign-Up Error:", error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setErr("Google sign-up was cancelled. Please try again.");
      } else if (error.code === 'auth/popup-blocked') {
        setErr("Popup was blocked by browser. Please allow popups and try again.");
      } else if (error.code === 'auth/network-request-failed') {
        setErr("Network error. Please check your internet connection.");
      } else {
        setErr(error.response?.data?.message || "Google sign-up failed! Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="card p-4 shadow"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h3 className="text-center mb-4">Sign Up</h3>
        
        {err && (
          <div className="alert alert-danger" role="alert">
            <i className="fa-solid fa-exclamation-triangle me-2"></i>
            {err}
          </div>
        )}
        
        <form onSubmit={handleSignUp}>
          {/* Full Name */}
          <div className="mb-3">
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              className="form-control"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Mobile Number */}
          <div className="mb-3">
            <label htmlFor="mobile" className="form-label">
              Mobile Number
            </label>
            <input
              type="tel"
              className="form-control"
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
              pattern="[0-9]{10}"
              maxLength="10"
              required
            />
          </div>

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

          {/* Role Selection */}
          <div className="mb-3">
            <label className="form-label">Select Role</label>
            <div className="d-flex gap-2">
              {["user", "owner", "deliveryBoy"].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`btn ${
                    role === r ? "btn-success" : "btn-outline-success"
                  }`}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing up...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
          {/* ---- OR ---- */}
          <div className="text-center my-3">OR</div>

          {/* Google Sign Up */}
          <button
            type="button"
            className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing up with Google...
              </>
            ) : (
              <>
                <img
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  alt="Google"
                  style={{ width: "20px", height: "20px" }}
                />
                Sign up with Google
              </>
            )}
          </button>

          {/* Switch to login */}
          <p
            className="mt-3"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            Already have an account?
            <button type="button" className="btn btn-outline-success btn-sm" onClick={() => navigate("/signin")}>
              Login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
