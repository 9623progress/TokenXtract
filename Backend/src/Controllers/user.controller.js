import { User, userResponse } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { scheme } from "../models/scheme.model.js";
import cloudinary from "../config/cloudinary.js";
import { contract, contractorApplication } from "../models/contract.model.js";

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
      { id: user._id, name: user.name, adhar: user.adhar },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    // Set the token in an HTTP-only cookie
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
      }, // Excluding password from the response
    });
  } catch (error) {
    console.error("Login error:", error); // Improved error logging
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const register = async (req, res) => {
  try {
    const { name, adhar, mobile, password } = req.body;

    // Validate Aadhaar (12 digits)
    const adharRegex = /^[0-9]{12}$/;
    if (!adharRegex.test(adhar)) {
      return res
        .status(400)
        .json({ message: "Aadhaar number must be exactly 12 digits" });
    }

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
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
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

    if (!userID || !schemeID) {
      return res.status(400).json({ message: "Missing userID or schemeID" });
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

    // Save responses in the database
    const UserResponse = new userResponse({
      userID,
      schemeID,
      responses,
    });

    await UserResponse.save();

    return res.status(200).json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error submitting form", error);
    return res.status(500).json({ message: "Error submitting form", error });
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
    const { budget, contractId } = req.body;
    const { userId } = req.params;
    const pdf = req.file?.path;
    console.log(req.file);
    const budgetValue = parseFloat(budget);
    // Validate required fields
    if (!pdf || isNaN(budgetValue)) {
      return res.status(400).json({
        message: "Valid budget and pdf file are required",
      });
    }

    // Check if user and contract exist
    const userExist = await User.findById(userId);
    const contractExist = await contract.findById(contractId);

    if (!contractExist) {
      return res.status(404).json({
        message: "Contract not found",
      });
    }

    if (!userExist) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Create a new contractor application
    const newApplication = new contractorApplication({
      userId,
      contractId,
      pdf,
      Budget: budget,
    });

    await newApplication.save();

    return res.status(200).json({ message: "Applied successfully" });
  } catch (error) {
    console.error("Error applying for contract:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
