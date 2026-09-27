import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { resetPassword } from "../../services/authApi";
import "./ForgotPassword.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await resetPassword(token, password);
      navigate("/login", { state: { message: "Password reset successful. Please login." } });
    } catch (resetError) {
      setError(resetError.response?.data?.message || "Reset link is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container forgot-password-container">
        <div className="auth-logo">
          <div className="auth-logo-icon"><LockKeyhole size={22} /></div>
          <h1>VoltRide</h1>
        </div>
        <div className="auth-heading">
          <h2>Reset password</h2>
          <p>Create a new password for your account.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="new-password">New password</label>
            <input id="new-password" type="password" minLength="6" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <div className="auth-field">
            <label htmlFor="confirm-password">Confirm password</label>
            <input id="confirm-password" type="password" minLength="6" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          </div>
          <button type="submit" className="auth-submit-button">{loading ? "Updating..." : "Update Password"}</button>
        </form>
        {error && <div className="forgot-password-error">{error}</div>}
        <div className="auth-bottom-text forgot-back-link">
          <Link to="/login"><ArrowLeft size={14} />Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;