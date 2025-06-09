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

    // console.log(walletAddress);

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

    if (!ExistingUser) {
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
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Invalid ID",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({
        message: "Sorry, user not found",
      });
    }

    // Fetch all user responses where fund has been disbursed
    const applications = await userResponse
      .find({ userID: id, fundDisburst: true })
      .populate("schemeID");

    // Calculate total tokens received
    const totalTokensReceived = applications.reduce(
      (sum, app) => sum + app.schemeID.amountPerUser,
      0
    );

    // Create token history
    const tokenHistory = applications.map((app) => ({
      schemeID: app.schemeID._id.toString(),
      amount: app.schemeID.amountPerUser,
      // date: app.submittedAt,
    }));

    res.status(200).json({
      message: `Welcome ${user.name}`,
      user: {
        id: user._id,
        name: user.name,
        adhar: user.adhar,
        role: user.role,
        totalTokensReceived,
        tokenHistory,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const applyForContract = async (req, res) => {
  try {
    const { budget, contractId, secreteKey } = req.body;
    const { userId } = req.params;
    const pdf = req.file?.path;
    // console.log("Uploaded File:", req.file);

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
    // console.log(contractId, stageId, fileUrl);

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

// import UserResponse from "../models/UserResponse.js"; // Import the UserResponse model

export const getMyAppliedSchemes = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from request

    // Fetch user responses and populate scheme details
    const applications = await userResponse
      .find({ userID: userId })
      .populate({
        path: "schemeID",
        select: "schemeName form", // Also fetch 'form' which links to formFieldScheme
        populate: {
          path: "form",
          select: "label", // Populate from formFieldScheme to get labels
        },
      })
      .populate({
        path: "responses.key",
        select: "label", // Get labels from formFieldScheme
      });

    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: "No applied schemes found." });
    }

    // Format response to send proper labels
    const appliedSchemes = applications.map((app) => ({
      _id: app._id,
      schemeName: app.schemeID.schemeName,
      accepted: app.Accepted,
      rejected: app.Rejected,
      fundDisbursed: app.fundDisburst,
      tokensReceived: app.tokensReceived,
      dateApplied: app.submittedAt,
      responses: app.responses.map((response) => ({
        key: response.key._id,
        label: response.key.label || "Unknown Field", // Now correctly fetching label
        value: response.value,
      })),
    }));
    // console.log(appliedSchemes);
    // console.log(appliedSchemes);
    return res.status(200).json({ appliedSchemes });
  } catch (error) {
    console.error("Error fetching applied schemes:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

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

export const reapplyForScheme = async (req, res) => {
  try {
    // console.log("Reapply API Called");
    // console.log("Request Params:", req.params);
    // console.log("Request Body:", req.body);

    const applicationId = req.params.schemeId || req.params.id; // Fix here

    if (!applicationId) {
      console.error("Error: Application ID is missing.");
      return res.status(400).json({ message: "Application ID is required." });
    }

    const { updatedResponses } = req.body;

    if (!updatedResponses) {
      console.error("Error: Missing updated responses in request body.");
      return res
        .status(400)
        .json({ message: "Updated responses are required." });
    }

    // Find the application in DB
    const application = await userResponse.findById(applicationId); // ✅ this matches the _id

    if (!application) {
      console.error("Error: Application not found.");
      return res.status(404).json({ message: "Application not found." });
    }

    // application.responses.forEach((r) => {
    //   console.log("Key Type:", r.key, "typeof:", typeof r.key);
    // });

    // console.log("Updated Responses:", updatedResponses);
    // console.log("Before update:", application.responses);

    // Update responses
    application.responses = application.responses.map((resp) => {
      const key =
        resp.key && typeof resp.key === "object" && resp.key.toString
          ? resp.key.toString()
          : resp.key;

      return {
        ...resp,
        value: updatedResponses[key] || resp.value,
      };
    });
    // Reset status fields
    application.Accepted = false;
    application.Rejected = false;
    application.fundDisbursed = false; // optional: reset only if needed
    application.tokensReceived = 0; // optional: reset if needed

    await application.save();
    // console.log("After update:", application.responses);

    return res.status(200).json({ message: "Reapplied successfully!" });
  } catch (error) {
    console.error("Reapply error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// const User = require("../models/User"); // Import User model

export const reapply = async (req, res) => {
  try {
    const { userId } = req.params; // Get user ID from params
    // console.log(userId);

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update application status
    user.applicationStatus = "Reapplied"; // Adjust based on your schema
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Reapplied successfully", user });
  } catch (error) {
    console.error("Reapply Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET /api/v1/user/tokenStats
// import User from "../models/user.model.js"; // make sure you're importing this

export const getTokenStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Calculate total tokens received from tokenHistory
    let totalTokensReceived = 0;

    if (user.tokenHistory && user.tokenHistory.length > 0) {
      totalTokensReceived = user.tokenHistory
        .filter((txn) => txn.amount > 0) // Count only positive transactions
        .reduce((sum, txn) => sum + txn.amount, 0);
    }

    return res.status(200).json({
      success: true,
      totalTokensReceived,
      tokenHistory: user.tokenHistory || [],
    });
  } catch (error) {
    console.error("Error in getTokenStats:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateMoney = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (amount == null || isNaN(amount)) {
      return res.status(400).json({
        message: "Amount is required and must be a number",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.Rupees += amount;
    await user.save();

    return res.status(200).json({
      message: "Amount updated",
      newBalance: user.Rupees,
    });
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMoney = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      data: user.Rupees,
      message: "success",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
