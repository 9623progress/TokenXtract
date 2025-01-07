import { User, userResponse } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { scheme } from "../models/scheme.model.js";
import cloudinary from "../config/cloudinary.js";

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
  const form = await scheme.findById(schemeID);

  res.status(200).json({
    message: "success",
    form: form.form,
  });
};

export const submitForm = async (req, res) => {
  try {
    const { schemeID, userID, responses } = req.body;

    if (!schemeID || !userID || !responses) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Process responses to handle file uploads with specific labels
    const processedResponses = await Promise.all(
      responses.map(async (response) => {
        if (response.type === "file" && response.file) {
          // Upload the file to Cloudinary
          const uploadedFile = await cloudinary.uploader.upload(response.file, {
            folder: "government_fund_distribution/form_upload", // Cloudinary folder
            resource_type: "auto", // Auto-detect file type (e.g., image, PDF)
          });

          // Return the response with file metadata and label
          return {
            label: response.label, // Preserve the specific label
            fileUrl: uploadedFile.secure_url, // File URL from Cloudinary
            originalName: uploadedFile.original_filename, // Optional metadata
          };
        }

        // Return non-file responses as-is
        return response;
      })
    );

    const responseEntry = new userResponse({
      schemeID,
      userID,
      responses: processedResponses,
    });

    await responseEntry.save();

    res.status(201).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit the form." });
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
