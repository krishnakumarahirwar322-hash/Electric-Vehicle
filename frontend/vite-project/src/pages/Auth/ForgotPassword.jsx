import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import "./ForgotPassword.css";
import { requestPasswordReset } from "../../services/authApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Reset email could not be sent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container forgot-password-container">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Mail size={22} />
          </div>
          <h1>VoltRide</h1>
        </div>

        <div className="auth-heading">
          <h2>Forgot password</h2>
          <p>Enter your email address and we will send reset instructions.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-button">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {error && <div className="forgot-password-error">{error}</div>}

        {submitted && (
          <div className="forgot-password-success">
            Reset instructions were sent to <strong>{email}</strong>. Check your inbox and spam folder.
          </div>
        )}

        <div className="auth-bottom-text forgot-back-link">
          <Link to="/login">
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
