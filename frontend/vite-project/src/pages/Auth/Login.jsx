import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap } from "lucide-react";
import "./Login.css";
import { loginUser } from "../../services/authApi.js";

const Login = () => {
const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await loginUser(formData);

    console.log("LOGIN RESPONSE:", response.data);
    console.log("USER:", response.data?.user);
    console.log("ROLE:", response.data?.user?.role);

    if (response.data?.success) {
      const user = response.data.user;
      const role = user?.role?.toLowerCase();

      // JWT token save
      localStorage.setItem("token", response.data.token);

      // User information save
      localStorage.setItem("user", JSON.stringify(user));

      console.log("ROLE:", role);

      // Role ke according redirect
      if (role === "admin") {
        console.log("Redirecting to ADMIN");
        navigate("/admin/dashboard");
      } 
      else if (role === "user") {
        console.log("Redirecting to USER");
        navigate("/user/home");
      } 
      else if (role === "driver") {
        console.log("Redirecting to DRIVER");
        navigate("/driver/dashboard");
      } 
      else {
        alert("Invalid role: " + role);
      }

    } else {
      alert(response.data?.message || "Login failed");
    }

  } catch (error) {
    console.error("Login Error:", error);

    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);
    console.log("HEADERS:", error.response?.headers);

    if (error.response) {
      alert(
        `Status: ${error.response.status}\n` +
        `Response: ${JSON.stringify(error.response.data)}`
      );
    } else {
      alert("Backend connection failed!");
    }
  }
};

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* LOGO */}

        <div className="auth-logo">

          <div className="auth-logo-icon">
            <Zap size={23} fill="currentColor" />
          </div>

          <h1>VoltRide</h1>

        </div>


        {/* HEADING */}

        <div className="auth-heading">

          <h2>Welcome back</h2>

          <p>
            Login to your VoltRide account
          </p>

        </div>


        {/* LOGIN FORM */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* EMAIL */}

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


          {/* PASSWORD */}

          <div className="auth-field">

            <label htmlFor="login-password">
              Password
            </label>

            <div className="password-wrapper">

              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
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


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="auth-submit-button"
          >
            Login
          </button>

        </form>


        {/* REGISTER */}

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