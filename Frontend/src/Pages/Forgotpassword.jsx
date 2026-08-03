import React, { useState } from "react";
import axios from "axios"; 
import { useNavigate } from "react-router-dom";

const Forgotpassword = () => {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const serverUrl = import.meta.env.VITE_SERVER_URL ;
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    try {
      const result = await axios.post(`${serverUrl}/send-otp`, { email }, { withCredentials: true });
      console.log(result.data);
      setStep(2);
    } catch (error) {
      console.log(error);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    try {
      const result = await axios.post(`${serverUrl}/verify-otp`, { email, otp }, { withCredentials: true });
      console.log(result.data);
      setStep(3);
    } catch (error) {
      console.log(error);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const result = await axios.post(`${serverUrl}/reset-password`, { email, newPassword }, { withCredentials: true });
      console.log(result.data);
      alert("Password reset successful!");
      navigate("/signin");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "400px" }}>
        <h3 className="text-center mb-4">Forgot Password</h3>

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <button type="submit" className="btn btn-success w-100" onClick={handleSendOtp}>
              Send OTP
            </button>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-3">
              <label htmlFor="otp" className="form-label">Enter OTP</label>
              <input
                type="text"
                className="form-control"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
              />
            </div>
            <button type="submit" className="btn btn-success w-100" onClick={handleVerifyOtp}>
              Verify OTP
            </button>
          </form>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
              />
            </div>
            <button type="submit" className="btn btn-success w-100" onClick={handleResetPassword}>
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Forgotpassword;
