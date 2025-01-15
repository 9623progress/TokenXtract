import mongoose, { Mongoose } from "mongoose";

const formFieldSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["text", "number", "dropdown", "radio", "date", "image"], // You can add more field types as needed
  },
  uniqueName: {
    type: String,
    required: true,
    trim: true,
  },
  required: {
    type: Boolean,
    default: true, // Default to true, unless specified otherwise
  },
  options: {
    type: [String],
    validate: {
      validator: function (value) {
        // Only validate options if type is dropdown or radio
        if (this.type === "dropdown" || this.type === "radio") {
          return value && value.length > 0; // Ensure there are options if the field is dropdown or radio
        }
        return true;
      },
      message: "Options are required for dropdown or radio fields",
    },
  },
});

const schemeModel = new mongoose.Schema({
  departmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "department",
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
  minAge: {
    type: Number,
    required: true,
    min: [0, "Minimum age cannot be negative"],
  },
  maxAge: {
    type: Number,
    required: true,
  },
  specialRequirement: {
    type: String,
    default: "", // Default to empty string if not provided
  },
  form: [{ type: mongoose.Schema.Types.ObjectId, ref: "formFieldSchema" }], // Use the formFieldSchema for consistency
  active: {
    type: Boolean,
    default: true, // Default to inactive
  },
});

export const scheme = mongoose.model("schemeForm", schemeModel);
export const formFieldSchem = mongoose.model(
  "formFieldSchema",
  formFieldSchema
);
