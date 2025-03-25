import { department } from "../models/department.model.js";
import { formFieldSchem, scheme } from "../models/scheme.model.js";
import { User, userResponse } from "../models/user.model.js";
import { contract, contractorApplication } from "../models/contract.model.js";
import mongoose from "mongoose";

// functions to implement
//1.create scheme

//2.get  all schemes department wise - have option to send for approval to central gov if role is state and for cg publish option  and deactivate option

// 3.view all application => select department then select scheme then show the application
// Approve the or reject Application option -> this is same is for to the audit team also

//4.create token
// 5.view bank request

export const createScheme = async (req, res) => {
  const {
    departmentID,
    schemeName,
    budget,
    amountPerUser,
    form,
    minAge,
    maxAge,
    specialRequirement,
    UserId,
  } = req.body;

  if (
    !departmentID ||
    !schemeName ||
    !budget ||
    !amountPerUser ||
    !form ||
    !minAge ||
    !maxAge ||
    !UserId
  ) {
    return res.status(400).json({
      message: "fill all fields",
    });
  }

  const userExist = User.findById(UserId);
  if (!userExist) {
    return res.status(400).json({
      message: "Invalid User",
    });
  }

  const dep = await department.findById(departmentID);

  if (!dep) {
    return res.status(400).json({
      message: " department not found",
    });
  }

  if (form && form.length <= 0) {
    return res.status(400).json({
      message: "form template should not empty",
    });
  }
  const newForm = await Promise.all(
    form.map(async (f) => {
      console.log(f);
      const formField = new formFieldSchem(f);
      await formField.save(); // Save the individual form field
      return formField._id; // Store the reference ID
    })
  );

  console.log(newForm);
  const newScheme = new scheme({
    departmentID,
    schemeName,
    budget,
    amountPerUser,
    minAge,
    maxAge,
    specialRequirement,
    form: newForm,
    creator: UserId,
  });

  await newScheme.save();

  return res.status(200).json({
    message: "Scheme created sucessfully",
  });
};

export const getAllschemeByDepartment = async (req, res) => {
  const { departmentID } = req.params;

  if (!departmentID) {
    res.status(400).json({
      message: "department id is required",
    });
  }
  const schemes = await scheme
    .find({ departmentID })
    .populate("departmentID", "departmentName");

  return res.status(200).json({
    schemes,
  });
};

export const createDepartment = async (req, res) => {
  try {
    const { departmentName, des } = req.body;
    const image = req.file?.path;

    if (!departmentName || !image || !des) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const newDepartment = new department({
      departmentName,
      des,
      image,
    });
    await newDepartment.save();

    res.status(200).json({
      message: "Department created successfully",
      department: newDepartment,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getAllApplicationByScheme = async (req, res) => {
  try {
    const { schemeID } = req.params;

    if (!schemeID) {
      res.status(400).json({
        message: "Invalid schemeID",
      });
    }
    const applicants = await userResponse
      .find({ schemeID, Accepted: false, Rejected: false })
      .populate({
        path: "responses.key",
        select: "label type",
      });

    res.status(200).json({
      applicants,
      message: "all applicants are send",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getDepartment = async (req, res) => {
  try {
    const departments = await department.find();

    res.status(200).json({
      message: "here are the departments",
      departments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const schemeData = await scheme
      .findById(id)
      .populate("form")
      .populate("departmentID");

    if (!schemeData) {
      return res.status(400).json({
        message: "Scheme Not found",
      });
    }

    res.status(200).json({
      schemeData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateScheme = async (req, res) => {
  const { id } = req.params; // Get the scheme ID from the URL
  const {
    departmentID,
    schemeName,
    budget,
    amountPerUser,
    form, // This contains both existing and new form fields
    minAge,
    maxAge,
    specialRequirement,
  } = req.body;

  console.log(
    departmentID,
    schemeName,
    budget,
    amountPerUser,
    form,
    minAge,
    maxAge,
    specialRequirement
  );

  // Fetch the existing scheme from the database
  const existingScheme = await scheme.findById(id);

  if (!existingScheme) {
    return res.status(404).json({ message: "Scheme not found" });
  }

  // Validate the departmentID
  const dep = await department.findById(departmentID);
  if (!dep) {
    return res.status(400).json({ message: "Department not found" });
  }

  // Validate form if it's provided
  if (form && form.length <= 0) {
    return res
      .status(400)
      .json({ message: "Form template should not be empty" });
  }

  let newForm = [...existingScheme.form]; // Default to existing form
  if (form) {
    try {
      const newFormFields = await Promise.all(
        form.map(async (f) => {
          // Check for valid field data
          if (!f.label || !f.uniqueName || !f.type) {
            return res
              .status(400)
              .json({ message: "Form field data is incomplete" });
          }

          if (f.id != "") {
            // Update existing form field
            const existingField = await formFieldSchem.findById(f.id);
            if (!existingField) {
              return res.status(404).json({ message: "Form field not found" });
            }

            existingField.label = f.label;
            existingField.type = f.type;
            existingField.uniqueName = f.uniqueName;

            await existingField.save(); // Save the updated form field
          } else {
            // Create a new form field if it doesn't exist
            const formField = new formFieldSchem(f);
            await formField.save(); // Save the new form field
            return formField._id; // Return the ID of the new form field
          }
        })
      );

      // Add only unique form field IDs to the newForm array
      const newFormWithUniqueIDs = [
        ...new Set([
          ...existingScheme.form
            .map((existingID) => existingID?.toString()) // Safely call toString() if existingID is defined
            .filter((id) => id), // Remove any undefined values from the array
          ...newFormFields.map((newField) => newField?.toString()), // Convert new form fields to strings
        ]), // Remove duplicates by using Set
      ];

      newForm = newFormWithUniqueIDs; // Assign the final unique form field IDs
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Error occurred while processing form fields",
        error: error.message,
      });
    }
  }

  // Prepare the update object with both old and new values
  const updatedScheme = {
    departmentID: departmentID || existingScheme.departmentID,
    schemeName: schemeName || existingScheme.schemeName,
    budget: budget || existingScheme.budget,
    amountPerUser: amountPerUser || existingScheme.amountPerUser,
    minAge: minAge || existingScheme.minAge,
    maxAge: maxAge || existingScheme.maxAge,
    specialRequirement: specialRequirement || existingScheme.specialRequirement,
    form: newForm,
  };

  // Update the scheme in the database
  try {
    const updatedSchemeData = await scheme.findByIdAndUpdate(
      id,
      updatedScheme,
      {
        new: true, // Return the updated document
        runValidators: true, // Run validation during update
      }
    );

    return res.status(200).json({
      message: "Scheme updated successfully",
      scheme: updatedSchemeData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "An error occurred while updating the scheme",
    });
  }
};

export const acceptForm = async (req, res) => {
  try {
    const id = req.params.id;

    // Find the user response by ID
    const userRes = await userResponse.findById(id);

    if (!userRes) {
      return res.status(400).json({
        message: "User Response is not found",
      });
    }

    // Update the document to mark as accepted
    const updatedRes = await userResponse.findByIdAndUpdate(
      id,
      { $set: { Accepted: true } }, // Update operation
      { new: true } // Return the updated document
    );

    // Send success response
    return res.status(200).json({
      message: "Form Accepted",
      data: updatedRes,
    });
  } catch (error) {
    console.error("Error accepting form:", error);

    // Send error response
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const RejectForm = async (req, res) => {
  try {
    const id = req.params.id;

    // Find the user response by ID
    const userRes = await userResponse.findById(id);

    if (!userRes) {
      return res.status(400).json({
        message: "User Response is not found",
      });
    }

    // Update the document to mark as accepted
    const updatedRes = await userResponse.findByIdAndUpdate(
      id,
      { $set: { Rejected: true } }, // Update operation
      { new: true } // Return the updated document
    );

    // Send success response
    return res.status(200).json({
      message: "Form Rejected",
      data: updatedRes,
    });
  } catch (error) {
    console.error("Error accepting form:", error);

    // Send error response
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAcceptedForm = async (req, res) => {
  try {
    const schemeID = req.params.id;

    if (!schemeID) {
      res.status(400).json({
        message: "Invalid schemeID",
      });
    }
    const applicants = await userResponse
      .find({ schemeID, Accepted: true, fundDisburst: false })
      .populate({
        path: "responses.key",
        select: "label type",
      });

    res.status(200).json({
      applicants,
      message: "all applicants are send",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getRejectedForm = async (req, res) => {
  try {
    const schemeID = req.params.id;

    if (!schemeID) {
      res.status(400).json({
        message: "Invalid schemeID",
      });
    }
    const applicants = await userResponse
      .find({ schemeID, Rejected: true })
      .populate({
        path: "responses.key",
        select: "label type",
      });

    res.status(200).json({
      applicants,
      message: "all applicants are send",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getAcceptedApplicantsWallet = async (req, res) => {
  try {
      const { schemeID } = req.params;

      // Fetch users where accepted is true for a specific scheme
      const acceptedApplicants = await userResponse.find({
          schemeID: schemeID,
          Accepted: true // Only fetch users who are accepted
      })
      .populate({
          path: "userID",
          select: "walletAddress",// Fetch only walletAddress
          // select:"name" 
      })
      .populate({
          path: "schemeID",
          select: "amountPerUser" // Fetch amountPerUser
      });

      if (!acceptedApplicants.length) {
          return res.status(404).json({ success: false, message: "No accepted applicants found." });
      }

      // Extract necessary data
      const formattedResponse = acceptedApplicants.map(applicant => ({
          walletAddress: applicant.userID.walletAddress,
          // name: applicant.userID.name,
          amountPerUser: applicant.schemeID.amountPerUser
      }));

      res.status(200).json({ success: true, data: formattedResponse });
  } catch (error) {
      console.error("Error fetching accepted applicants:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create Contract
export const createContract = async (req, res) => {
  const {
    contractName,
    budget,
    state,
    district,
    city,
    localAddress,
    startDate,
    endDate,
    legalRules,
    stages,
    secreteKey,
  } = req.body;

  const { user } = req.params;

  if (
    !contractName ||
    !state ||
    !district ||
    !city ||
    !localAddress ||
    !startDate ||
    !endDate ||
    !budget ||
    !legalRules ||
    !stages ||
    !secreteKey
  ) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  console.log(stages);

  if (
    !Array.isArray(stages) ||
    !stages.every(
      (stage) =>
        stage &&
        typeof stage.stageName === "string" &&
        typeof Number(stage.percentage) === "number" &&
        !isNaN(Number(stage.percentage)) &&
        stage.percentage >= 0 &&
        stage.percentage <= 100
    )
  ) {
    return res.status(400).json({
      message:
        "Stages must be an array of objects with valid stageName and percentage (0-100).",
    });
  }

  try {
    const newContract = new contract({
      contractName,
      budget,
      state,
      district,
      city,
      localAddress,
      startDate,
      endDate,
      legalRules,
      stages,
      secreteKey,
      creator: user,
    });

    await newContract.save();

    return res.status(201).json({
      message: "Contract created successfully",
      contract: newContract,
    });
  } catch (error) {
    console.error("Error creating contract:", error.message);
    return res.status(500).json({
      message: "Failed to create contract",
      error: error.message,
    });
  }
};

// Assign Contract
export const assignContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { contractorId } = req.body;
    // console.log(contractorId);
    const contractExist = await contract.findById(contractId);
    if (!contractExist) {
      return res.status(404).json({
        message: "Contract does not exist",
      });
    }

    const contractorExist = await User.findById(contractorId);
    if (!contractorExist) {
      return res.status(404).json({
        message: "Contractor does not exist",
      });
    }

    await contract.findByIdAndUpdate(contractId, {
      $set: { contractor: contractorId },
    });

    return res.status(200).json({
      message: "Contract assigned successfully",
    });
  } catch (error) {
    console.error("Error assigning contract:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Contracts by Department
export const getContractByDepartment = async (req, res) => {
  try {
    const { departmentID } = req.params;
    const contracts = await contract.find({ departmentID });

    if (contracts.length === 0) {
      return res.status(404).json({
        message: "No contracts found for this department",
      });
    }

    return res.status(200).json(contracts);
  } catch (error) {
    console.error("Error fetching contracts by department:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// View Contract Applications
export const viewContractApplication = async (req, res) => {
  try {
    const { contractId } = req.params;

    const applications = await contractorApplication
      .find({ contractId })
      .populate("userId");

    if (applications.length === 0) {
      return res.status(404).json({
        message: "No applications found for this contract",
      });
    }

    return res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching contract applications:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createToken = async (req, res) => {
  try {
    const { TokenAmount, userId } = req.body;

    const Token = Number(TokenAmount);
    // Validate input
    if (!Token || typeof Token !== "number" || Token <= 0) {
      return res.status(400).json({
        message: "Invalid Token Amount",
      });
    }

    const userExist = await User.findById(userId).select("-password");
    if (!userExist) {
      return res.status(400).json({
        message: "User not Exist",
      });
    }

    // Initialize Token if missing
    if (typeof userExist.Token !== "number") {
      userExist.Token = 0;
    }

    userExist.Token += Token;
    await userExist.save();

    return res.status(200).json({
      message: "Token added successfully",
      user: userExist,
    });
  } catch (error) {
    console.error("Error creating token:", error.message);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const disburseFundsBulk = async (req, res) => {
  try {
    const { schemeID, adminId } = req.body;

    // Fetch admin details
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // Fetch scheme applications where `accepted` is true
    const schemeApplications = await userResponse
      .find({
        schemeID: schemeID,
        Accepted: true,
      })
      .populate("schemeID");

    if (!schemeApplications || schemeApplications.length === 0) {
      return res
        .status(400)
        .json({ message: "No accepted applications found for this scheme" });
    }

    // Calculate total funds required for all accepted applications
    const totalAmount = schemeApplications.reduce(
      (sum, application) => sum + application.schemeID.amountPerUser,
      0
    );

    // Check if admin has sufficient funds
    if (admin.Token < totalAmount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Deduct total funds from admin
    admin.Token -= totalAmount;
    await admin.save();

    // Disburse funds to each user
    const failedDisbursements = [];
    for (const application of schemeApplications) {
      try {
        const user = await User.findById(application.userID);
        if (user) {
          user.Token += application.schemeID.amountPerUser;

          await user.save();
          application.fundDisburst = true;
          application.save();
        } else {
          failedDisbursements.push(application.userID);
        }
      } catch (error) {
        console.error(
          `Error disbursing funds to user ${application.userID}:`,
          error.message
        );
        failedDisbursements.push(application.userID);
      }
    }

    // Respond with the result
    return res.status(200).json({
      message: "Funds disbursed successfully",
      failedDisbursements:
        failedDisbursements.length > 0 ? failedDisbursements : null,
    });
  } catch (error) {
    console.error("Error in bulk fund disbursement:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMyCreatedContract = async (req, res) => {
  try {
    const { userId } = req.params;

    const myContracts = await contract.find({ creator: userId });

    if (!myContracts.length) {
      return res.status(404).json({
        message: "No contracts found for this user",
      });
    }

    return res.status(200).json({
      data: myContracts,
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getPendingContracts = async (req, res) => {
  try {
    const PendingContracts = await contract
      .find({ ApproveContract: false })
      .select("-secreteKey");

    return res.status(200).json({
      data: PendingContracts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getMyApprovedContracts = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const myContracts = await contract
      .find({ creator: userId, ApproveContract: true })
      .populate("contractor")
      .lean();

    return res.status(200).json({
      data: myContracts,
      message: myContracts.length
        ? "Approved contracts fetched successfully"
        : "No approved contracts found for this user",
    });
  } catch (error) {
    console.error("Error fetching approved contracts:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getMyPendingContracts = async (req, res) => {
  try {
    const { userId } = req.params;

    const myContracts = await contract.find({
      creator: userId,
      ApproveContract: false,
    });

    if (!myContracts.length) {
      return res.status(404).json({
        message: "No contracts found for this user",
      });
    }

    return res.status(200).json({
      data: myContracts,
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const approveContract = async (req, res) => {
  try {
    const { contractId } = req.body; // Ensure contractId is extracted correctly

    if (!contractId || contractId.length !== 24) {
      return res.status(400).json({ message: "Invalid contract ID" });
    }

    const contractToBeApprove = await contract.findById(contractId);

    if (!contractToBeApprove) {
      return res.status(400).json({ message: "Contract not found" });
    }

    await contractToBeApprove.updateOne({ $set: { ApproveContract: true } });

    res.status(200).json({ message: "Contract Approved Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const approveContractStage = async (req, res) => {
  try {
    const { contractId, contractStageId, proof } = req.body;
    if (!contractId || !contractStageId || !proof) {
      return res.status(400).json({
        message: "All fields are necessary",
      });
    }

    // Find the contract document
    const contractToBeApprove = await contract.findById(contractId);

    if (!contractToBeApprove) {
      return res.status(400).json({ message: "Contract not found" });
    }

    const stage = contractToBeApprove.stages.find(
      (stage) => stage._id.toString() === contractStageId
    );

    if (!stage) {
      return res.status(400).json({ message: "Stage not found" });
    }

    stage.approve = true;
    stage.proof = proof;

    await contractToBeApprove.save();
    return res.status(200).json({
      message: "Stage approved successfully",
      updatedContract: contractToBeApprove,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
