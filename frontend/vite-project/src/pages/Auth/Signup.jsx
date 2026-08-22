import React, { useState } from "react";
import { Eye, EyeOff, Zap } from "lucide-react";

import "./Signup.css";


const Signup = () => {

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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


    if (
      formData.password !==
      formData.confirmPassword
    ) {

      alert("Passwords do not match");

      return;
    }


    const registrationData = {

      name: formData.name,

      email: formData.email,

      password: formData.password,

      role: "USER",

    };


    console.log(
      "Registration Data:",
      registrationData
    );


    // Later:
    // POST /api/auth/register
  };


  return (
    <div className="signup-page">

      <div className="signup-container">


        {/* =================================
            LOGO
        ================================= */}

        <div className="signup-logo">

          <div className="signup-logo-icon">

            <Zap
              size={23}
              fill="currentColor"
            />

          </div>

          <h1>
            VoltRide
          </h1>

        </div>



        {/* =================================
            HEADING
        ================================= */}

        <div className="signup-heading">

          <h2>
            Create account
          </h2>

          <p>
            Join VoltRide and start riding
          </p>

        </div>



        {/* =================================
            FORM
        ================================= */}

        <form
          className="signup-form"
          onSubmit={handleSubmit}
        >


          {/* NAME */}

          <div className="signup-field">

            <label htmlFor="signup-name">
              Full Name
            </label>

            <input
              id="signup-name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
              required
            />

          </div>



          {/* EMAIL */}

          <div className="signup-field">

            <label htmlFor="signup-email">
              Email
            </label>

            <input
              id="signup-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              maxLength={100}
              required
            />

          </div>



          {/* PASSWORD */}

          <div className="signup-field">

            <label htmlFor="signup-password">
              Password
            </label>

            <div className="signup-password-wrapper">

              <input
                id="signup-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                maxLength={255}
                required
              />

              <button
                type="button"
                className="signup-password-toggle"
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



          {/* CONFIRM PASSWORD */}

          <div className="signup-field">

            <label htmlFor="confirm-password">
              Confirm Password
            </label>

            <div className="signup-password-wrapper">

              <input
                id="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="signup-password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >

                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}

              </button>

            </div>

          </div>



          {/* REGISTER BUTTON */}

          <button
            type="submit"
            className="signup-submit-button"
          >
            Create Account
          </button>

        </form>



        {/* =================================
            LOGIN
        ================================= */}

        <div className="signup-bottom-text">

          <span>
            Already have an account?
          </span>

          <a href="/login">
            Login
          </a>

        </div>

      </div>

    </div>
  );
};


export default Signup;