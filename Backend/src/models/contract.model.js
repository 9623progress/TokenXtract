import mongoose from "mongoose";

// name of contract, department under it, area of work, like state, district, city, local address, timeline, budget, legal consequences, stages of monitoring
const contractSchema = new mongoose.Schema(
  {
    departmentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "department",
    },
    contractName: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    state: {
      type: String,
      required: true,
    },

    district: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    localAddress: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    legalRules: {
      type: String,
      required: true,
    },
    stages: [
      {
        stageName: {
          type: String,
          required: true,
        },
        percentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
      },
    ],

    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const ContractorApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "contracts",
  },
  pdf: {
    type: String,
    required: true,
  },
  Budget: {
    type: Number,
    required: true,
  },
});

export const contract = mongoose.model("contracts", contractSchema);
export const contractorApplication = mongoose.model(
  "contractorApplications",
  ContractorApplicationSchema
);
