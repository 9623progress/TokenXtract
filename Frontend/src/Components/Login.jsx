import React, { useState } from "react";
import "../style/login.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../ReduxStore/reduxSlice/userSlice";

const Login = () => {
  const [adhar, setAdhar] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleAdharChange = (event) => setAdhar(event.target.value);
  const handlePasswordChange = (event) => setPassword(event.target.value);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!adhar || !password) {
      toast.warn("Please enter your Aadhaar number and password.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/user/login",
        { adhar, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Store user data and role in localStorage

        toast.success(response.data.message || "Login successful!");
        dispatch(login(response.data.user));
        // Navigate to a page based on user role
        const role = response.data.user.role; // Assuming user object has a 'role' property
        if (role === "cg") {
          navigate("/cg");
        } else if (role === "user") {
          navigate("/user-profile");
        } else {
          navigate("/"); // Default redirect if no role match
        }
      } else {
        toast.warn(response.data.message || "Invalid Aadhaar or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-box">
      <div className="login-form">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="login-input">
            <label htmlFor="adharNum">Aadhaar Number</label>
            <input
              type="text"
              onChange={handleAdharChange}
              value={adhar}
              id="adharNum"
              placeholder="Enter your 12-digit Aadhaar number"
              maxLength="12"
              required
            />
          </div>
          <div className="login-input">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                onChange={handlePasswordChange}
                value={password}
                id="password"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
          <div className="login-button">
            <button type="submit">Login</button>
          </div>
        </form>
        <p>Don't have an account?</p>
        <Link to="/signin">Sign up</Link>
      </div>
    </div>
  );
};

export default Login;
