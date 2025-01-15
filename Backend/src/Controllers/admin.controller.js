import { department } from "../models/department.modal.js";
import { formFieldSchem, scheme } from "../models/scheme.model.js";
import { userResponse } from "../models/user.model.js";

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
  } = req.body;

  if (
    !departmentID ||
    !schemeName ||
    !budget ||
    !amountPerUser ||
    !form ||
    !minAge ||
    !maxAge
  ) {
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
    const applicants = await userResponse.find({ schemeID }).populate({
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
