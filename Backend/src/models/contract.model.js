import mongoose from "mongoose";

// 🔹 Contract Schema (unchanged except related contractor field)
const contractSchema = new mongoose.Schema(
  {
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
    secreteKey: {
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
        approve: {
          type: Boolean,
          default: false,
        },
        proof: {
          type: String,
          default: "",
        },
        transactionId: {
          type: String,
          default: "",
        },
      },
    ],
    ApproveContract: {
      type: Boolean,
      default: false,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // 👇 Optional: track which admin approved it
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming admins are also stored in "User"
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming your user model is called "User"
      required: true,
    }
    
  },
  { timestamps: true }
);

const ContractorApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "contracts",
      required: true,
    },
    secreteKey: {
      type: String,
      required: true,
    },
    pdf: {
      type: String,
      required: true,
    },
    Budget: {
      type: Number,
      required: true,
    },
    // ✅ New fields for application tracking
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    reapplied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const contract = mongoose.model("contracts", contractSchema);
export const contractorApplication = mongoose.model(
  "contractorApplications",
  ContractorApplicationSchema
);
