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

  minAge: {
    type: Number,
    required: true,
    min: [0, "Minimum age cannot be negative"],
  },
  maxAge: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value >= this.minAge; // Ensure maxAge is greater than or equal to minAge
      },
      message: "Maximum age must be greater than or equal to minimum age",
    },
  },
  specialRequirement: {
    type: String,
  },
  form: [
    {
      label: { type: String, required: true },
      type: { type: String, required: true },
      uniqueName: { type: String, required: true },
      required: { type: Boolean, default: true }, // Is the field required?
      options: { type: [String] }, // Options for dropdowns/radio buttons
    },
  ],
  active: {
    type: Boolean,
    default: false,
  },
});

export const scheme = mongoose.model("schemeForm", schemeModel);
