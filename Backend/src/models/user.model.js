import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define the user schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  adhar: {
    type: String,
    required: true,
    unique: true,
    minlength: 12,
    maxlength: 12,
  },
  mobile: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10,
  },
  role: {
    type: String,
    default: "user",
  },
  password: {
    type: String,
    required: true,
  },
});

// Create and export the User model
const User = mongoose.model("User", UserSchema);
export default User;
