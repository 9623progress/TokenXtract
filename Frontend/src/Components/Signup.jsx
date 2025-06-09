import React, { useState } from "react";
import "../style/signup.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ethers } from "ethers";

const Signup = () => {
  const [name, setName] = useState("");
  const [adhar, setAdhar] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState(""); // New state for MetaMask address
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const navigate = useNavigate(); // For redirecting after successful registration

  // Handlers for input changes
  const handleNameChange = (e) => setName(e.target.value);
  const handleAdharChange = (e) => setAdhar(e.target.value);
  const handleMobileChange = (e) => setMobile(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleRoleChange = (e) => setRole(e.target.value);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  // Validate Aadhaar and mobile format
  const isValidAdhar = /^[0-9]{12}$/.test(adhar);
  const isValidMobile = /^[0-9]{10}$/.test(mobile);

  //  Connect MetaMask and get wallet address
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const formattedAddress = ethers.getAddress(accounts[0]);
        setWalletAddress(formattedAddress);
        toast.success(`Connected: ${formattedAddress}`);
      } catch (error) {
        console.log(error);
        toast.error("Failed to connect MetaMask.");
      }
    } else {
      toast.warning(
        "MetaMask is not installed. Please install it to continue."
      );
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !adhar || !mobile || !password || !walletAddress || !role) {
      toast.error("Please fill out all fields and connect MetaMask.");
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
          walletAddress, // Send MetaMask address with registration data
          role,
        },
        { withCredentials: true }
      );

      if (response.status === 201) {
        toast.success(response.data.message || "Registration successful!");
        setName("");
        setAdhar("");
        setMobile("");
        setPassword("");
        setWalletAddress("");
        navigate("/login"); // Redirect to login page
      } else {
        toast.error(response.data.message || "Registration failed!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
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
          <div className="sign-in-input ">
            <select className="sign-in-select" onChange={handleRoleChange}>
              <option value="user">Select Your Role</option>
              <option value="user">Scheme Holder</option>
              <option value="contractor">Contractor</option>
            </select>
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

          {/* MetaMask Wallet Address Field */}
          <div className="sign-in-input">
            <label htmlFor="walletAddress">MetaMask Wallet Address:</label>
            <div className="wallet-wrapper">
              <input
                type="text"
                id="walletAddress"
                value={walletAddress}
                readOnly
                placeholder="Connect your MetaMask wallet"
                required
              />
              <button
                type="button"
                className="connect-wallet-btn"
                onClick={connectMetaMask}
              >
                {walletAddress ? "Connected" : "Connect MetaMask"}
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
