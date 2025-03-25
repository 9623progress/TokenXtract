import { User, userResponse } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { scheme } from "../models/scheme.model.js";
import cloudinary from "../config/cloudinary.js";
import { contract, contractorApplication } from "../models/contract.model.js";
import mongoose from "mongoose";

export const login = async (req, res) => {
  try {
    const { adhar, password } = req.body;

    // console.log("Received Aadhaar:", adhar);
    // console.log("Received Password:", password);

    // Validate input fields (optional but recommended)
    if (!adhar || !password) {
      return res
        .status(400)
        .json({ message: "Please provide Aadhaar and password" });
    }

    // Check if user exists
    const user = await User.findOne({ adhar });
    if (!user) {
      return res.status(400).json({
        message:
          "User not found with this Aadhaar number, please register first.",
      });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Aadhaar or password." });
    }

    // Create a JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name, adhar: user.adhar, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60 * 60 * 1000,
    });

    // Respond with the user information (excluding password)
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        adhar: user.adhar,
        role: user.role,
        Token: user.Token,
        walletAddress: user.walletAddress,
      }, // Excluding password from the response
    });
  } catch (error) {
    console.error("Login error:", error); // Improved error logging
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const register = async (req, res) => {
  try {
    const { name, adhar, mobile, password, walletAddress, role } = req.body;

    // Validate Aadhaar (12 digits)
    const adharRegex = /^[0-9]{12}$/;
    if (!adharRegex.test(adhar)) {
      return res
        .status(400)
        .json({ message: "Aadhaar number must be exactly 12 digits" });
    }

    console.log(walletAddress);

    // Validate Mobile Number (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      return res
        .status(400)
        .json({ message: "Mobile number must be exactly 10 digits" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ adhar });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this Aadhar number" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      adhar,
      mobile,
      password: hashedPassword, // Store hashed password
      walletAddress,
      role,
    });

    await newUser.save();

    // Send success response
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // If you're in production, use HTTPS
    sameSite: "Strict", // Optional, if you need stricter cookie handling
    path: "/", // Ensure it matches the path used when setting the cookie
  });

  res.status(200).json({ message: "Logout successful" });
};

export const getSchemeForm = async (req, res) => {
  const { schemeID } = req.params;
  if (!schemeID) {
    res.status(400).json({
      message: "Invalid schemeID",
    });
  }
  const form = await scheme.findById(schemeID).populate("form");

  res.status(200).json({
    message: "success",
    form: form.form,
  });
};

export const submitForm = async (req, res) => {
  try {
    const { userID, schemeID } = req.body; // Extract userID and schemeID from the body
    // console.log(req.body);
    // console.log(req.files);
    if (!userID || !schemeID) {
      return res.status(400).json({ message: "Missing userID or schemeID" });
    }

    const ExistingUser = await User.findById(userID);

    if(!ExistingUser)
    {
      return res.status(400).json({ message: "Missing user" });
    }
    // Initialize responses array
    const responses = [];

    // Process text fields and radio buttons
    Object.keys(req.body).forEach((key) => {
      if (key !== "userID" && key !== "schemeID") {
        // For text and radio values
        responses.push({
          key, // Field name (use the field names from the form)
          value: req.body[key], // Value from req.body
        });
      }
    });

    // Process file fields
    req.files.forEach((file) => {
      responses.push({
        key: file.fieldname, // Field name for the file
        value: file.path, // Path where the file is saved
      });
    });

    const userIDObj = new mongoose.Types.ObjectId(userID);
    const schemeIDObj = new mongoose.Types.ObjectId(schemeID);

    // Save responses in the database
    const UserResponse = new userResponse({
      userID: userIDObj,
      schemeID: schemeIDObj,
      responses,
    });

    await UserResponse.save();
    ExistingUser.AppliedSchemesApplication.push(userResponse._id);

    return res.status(200).json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error(
      "Error submitting form:",
      error.stack || error.message || error
    );
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const userProfile = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      message: "invalid id",
    });
  }

  const user = await User.findById(id);

  if (!user) {
    res.status(400).json({
      message: "sorry user not found",
    });
  }

  res.status(200).json({
    message: `welcome ${user.name}`,
    user: {
      id: user._id,
      name: user.name,
      adhar: user.adhar,
      role: user.role,
    },
  });
};

export const applyForContract = async (req, res) => {
  try {
    const { budget, contractId, secreteKey } = req.body;
    const { userId } = req.params;
    const pdf = req.file?.path;
    console.log("Uploaded File:", req.file);

    const budgetValue = parseFloat(budget);

    // Validate required fields
    if (!pdf || isNaN(budgetValue)) {
      return res.status(400).json({
        message: "Valid budget and PDF file are required",
      });
    }

    // Check if user and contract exist
    const userExist = await User.findById(userId);
    const contractExist = await contract.findById(contractId); // Fixed: Model name

    if (!contractExist || contractExist.secreteKey !== secreteKey) {
      return res.status(404).json({ message: "Contract not found" });
    }

    if (!userExist) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new contractor application
    const newApplication = new contractorApplication({
      userId,
      contractId,
      pdf,
      Budget: budgetValue,
      secreteKey,
    });

    await newApplication.save();

    // Add application ID to user's applied contracts list
    userExist.AppliedContractApplication.push(newApplication._id);
    contractExist.contractor = userId;
    await contractExist.save();
    await userExist.save(); // Fixed: Saving user after update

    return res.status(200).json({ message: "Applied successfully" });
  } catch (error) {
    console.error("Error applying for contract:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getContractByState = async (req, res) => {
  try {
    const { state } = req.params;
    // console.log(state);

    const data = await contract
      .find({ state, ApproveContract: true })
      .select("-secreteKey");

    return res.status(200).json({
      data,
    });
  } catch (error) {
    console.log(error);
  }
};
export const getWalleteId = async (req, res) => {
  try {
    const { id } = req.params;

    const userExist = await User.findById(id);
    if (!userExist) {
      return res.status(400).json({
        message: "user not found",
      });
    }

    return res.status(200).json({
      walletAddress: userExist.walletAddress,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const getMyAppliedContract = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userData = await User.findById(id)
      .populate({
        path: "AppliedContractApplication",
        populate: { path: "contractId" },
      })
      .select("AppliedContractApplication");

    if (!userData) {
      return res.status(404).json({ message: "User Not Found" });
    }

    return res.status(200).json({ data: userData });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const uploadStageProof = async (req, res) => {
  try {
    const { contractId, stageId } = req.body;
    const fileUrl = req.file?.path || req.file?.url;
    console.log(contractId, stageId, fileUrl);

    if (!contractId || !stageId || !fileUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const contractExist = await contract.findById(contractId);
    if (!contractExist) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const stage = contractExist.stages.find(
      (s) => s._id.toString() === stageId
    );
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }

    stage.proof = fileUrl;
    await contractExist.save();

    return res.status(200).json({
      message: "Proof uploaded successfully",
      updatedStage: stage,
    });
  } catch (error) {
    console.error("Error uploading proof:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyAppliedSchemes = async (req, res) => {};

export const getBanks = async (req, res) => {
  try {
    const banks = await User.find({ role: "bank" });

    if (banks.length === 0) {
      return res.status(404).json({
        message: "No banks found",
      });
    }

    return res.status(200).json({
      banks,
    });
  } catch (error) {
    console.error("Error fetching banks:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
