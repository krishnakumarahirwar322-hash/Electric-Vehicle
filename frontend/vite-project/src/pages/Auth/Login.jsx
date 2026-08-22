import React, { useState } from "react";
import { Eye, EyeOff, Zap } from "lucide-react";

import "./Login.css";

const Login = () => {

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });


  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login Data:", formData);

    // Later:
    // POST /api/auth/login
  };


  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* Logo */}

        <div className="auth-logo">

          <div className="auth-logo-icon">
            <Zap size={23} fill="currentColor" />
          </div>

          <h1>
            VoltRide
          </h1>

        </div>


        {/* Heading */}

        <div className="auth-heading">

          <h2>
            Welcome back
          </h2>

          <p>
            Login to your VoltRide account
          </p>

        </div>


        {/* Login Form */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* Email */}

          <div className="auth-field">

            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>


          {/* Password */}

          <div className="auth-field">

            <label htmlFor="login-password">
              Password
            </label>

            <div className="password-wrapper">

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>


          {/* Login Button */}

          <button
            type="submit"
            className="auth-submit-button"
          >
            Login
          </button>

        </form>


        {/* Register */}

        <div className="auth-bottom-text">

          <span>
            Don't have an account?
          </span>

          <a href="/register">
            Register
          </a>

        </div>

      </div>

    </div>
  );
};

export default Login;