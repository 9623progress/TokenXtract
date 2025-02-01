import mongoose from "mongoose";

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
  Token: {
    type: Number,
    default: 0,
  },
  password: {
    type: String,
    required: true,
  },
});

const userResponseModel = new mongoose.Schema({
  schemeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "schemeForm",
    required: true,
  },
  responses: [
    {
      key: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "formFieldSchema",
        required: true,
      }, // Field label from the form
      value: { type: mongoose.Schema.Types.Mixed, required: true }, // User's input value
    },
  ],
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  Accepted: {
    type: Boolean,
    default: false,
  },
  Rejected: {
    type: Boolean,
    default: false,
  },
  fundDisburst: {
    type: Boolean,
    default: false,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

export const userResponse = mongoose.model("userResponse", userResponseModel);
export const User = mongoose.model("User", UserSchema);
