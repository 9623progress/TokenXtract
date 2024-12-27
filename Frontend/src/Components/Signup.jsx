import React, { useState } from "react";
import "../style/signup.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [adhar, setAdhar] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // For redirecting after successful registration

  // Handlers for input changes
  const handleNameChange = (e) => setName(e.target.value);
  const handleAdharChange = (e) => setAdhar(e.target.value);
  const handleMobileChange = (e) => setMobile(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  // Form validation
  const isValidAdhar = /^[0-9]{12}$/.test(adhar);
  const isValidMobile = /^[0-9]{10}$/.test(mobile);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !adhar || !mobile || !password) {
      toast.error("Please fill out all fields.");
      return;
    }

    if (!isValidAdhar) {
      toast.error("Aadhaar number must be exactly 12 digits.");
      return;
    }

    if (!isValidMobile) {
      toast.error("Mobile number must be exactly 10 digits.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/v1/user/register",
        {
          name,
          adhar,
          mobile,
          password,
        }
      );

      if (response.status === 201) {
        toast.success(response.data.message || "Registration successful!");
        setName("");
        setAdhar("");
        setMobile("");
        setPassword("");
        navigate("/login"); // Redirect to login page
      } else {
        toast.error(response.data.message || "Registration failed!");
      }
    } catch (error) {
      toast.error("An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-box">
      <div className="signin-form-box">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="sign-in-input">
            <label htmlFor="name">Enter Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="sign-in-input">
            <label htmlFor="adhar">Enter Aadhaar Number:</label>
            <input
              type="text"
              id="adhar"
              value={adhar}
              onChange={handleAdharChange}
              placeholder="Enter your 12-digit Aadhaar number"
              maxLength="12"
              required
            />
          </div>

          <div className="sign-in-input">
            <label htmlFor="mobile">Enter Mobile Number:</label>
            <input
              type="text"
              id="mobile"
              value={mobile}
              onChange={handleMobileChange}
              placeholder="Enter your 10-digit mobile number"
              maxLength="10"
              required
            />
          </div>

          <div className="sign-in-input">
            <label htmlFor="password">Enter Password:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter a strong password"
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

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p>Already have an account?</p>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default Signup;
