import { department } from "../models/department.modal.js";
import { scheme } from "../models/scheme.model.js";
import { userResponse } from "../models/user.model.js";

// functions to implement
//1.create scheme

//2.get  all schemes department wise - have option to send for approval to central gov if role is state and for cg publish option  and deactivate option

// 3.view all application => select department then select scheme then show the application
// Approve the or reject Application option -> this is same is for to the audit team also

//4.create token
// 5.view bank request

export const createScheme = async (req, res) => {
  const { departmentID, schemeName, budget, amountPerUser, form } = req.body;

  if (!departmentID || !schemeName || !budget || !amountPerUser || !form) {
    return res.status(400).json({
      message: "fill all fields",
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

  const newScheme = new scheme({
    departmentID,
    schemeName,
    budget,
    amountPerUser,
    form,
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
  const schemes = await scheme.find({ departmentID });

  return res.status(200).json({
    schemes,
  });
};

export const createDepartment = async (req, res) => {
  const { departmentName } = req.body;
  const image = req.file.path;
  if (!departmentName || !image) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const newDepartment = new department({
    departmentName,
    image,
  });

  await newDepartment.save();

  res.status(200).json({
    message: "department created successfully",
  });
};

export const getAllApplicationByScheme = async (req, res) => {
  const { schemeID } = req.params;

  if (!schemeID) {
    res.status(400).json({
      message: "Invalid schemeID",
    });
  }
  const applicants = await userResponse.find({ schemeID });

  res.status(200).json({
    applicants,
    message: "all applicants are send",
  });
};
