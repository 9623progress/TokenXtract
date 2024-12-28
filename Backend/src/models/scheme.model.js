import mongoose from "mongoose";

const schemeModel = new mongoose.Schema({
  departmentID: {
    type: String,
    required: true,
  },
  schemeName: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  amountPerUser: {
    type: Number,
    required: true,
  },
  form: [
    {
      label: { type: String, required: true },
      type: { type: String, required: true },
      placeholder: { type: String },
      required: { type: Boolean, default: false }, // Is the field required?
      options: { type: [String] }, // Options for dropdowns/radio buttons
    },
  ],
  active: {
    type: Boolean,
    default: false,
  },
});

export const scheme = mongoose.model("schemeForm", schemeModel);
