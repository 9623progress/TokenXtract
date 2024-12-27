import React, { useState } from "react";
import departments from "../utils/DepartmentsData"; // Assuming this is correct
import "../style/CreateScheme.css";
import DepartmentCard from "./DepartmentCard";

const CreateScheme = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentFields, setDepartmentFields] = useState([]);
  const [schemeName, setSchemeName] = useState("");
  const [budget, setBudget] = useState("");

  // Handle department change
  const handleDepartmentChange = (e) => {
    const departmentId = Number(e.target.value); // Ensure it's a number
    setSelectedDepartment(departmentId);
  };

  // Find the selected department from the list
  const selectedDept = departments.find(
    (dept) => dept.id === selectedDepartment
  );

  // Handle custom field changes (for labels and names)
  const handleFieldChange = (e, index) => {
    const { name, value } = e.target;
    const updatedFields = [...departmentFields];
    updatedFields[index][name] = value;
    setDepartmentFields(updatedFields);
  };

  // Add a new field to the form template
  const addField = () => {
    setDepartmentFields([
      ...departmentFields,
      { label: "", name: "", type: "text", options: [] }, // New field added with default values
    ]);
  };

  // Remove a field from the form template
  const removeField = (index) => {
    const updatedFields = departmentFields.filter((_, i) => i !== index);
    setDepartmentFields(updatedFields);
  };

  // Add a new option for radio type fields
  const addRadioOption = (index) => {
    const updatedFields = [...departmentFields];
    updatedFields[index].options.push(""); // Add empty option
    setDepartmentFields(updatedFields);
  };

  // Handle radio option input
  const handleRadioOptionChange = (e, fieldIndex, optionIndex) => {
    const { value } = e.target;
    const updatedFields = [...departmentFields];
    updatedFields[fieldIndex].options[optionIndex] = value;
    setDepartmentFields(updatedFields);
  };

  return (
    <div className="scheme-div">
      <div className="scheme-form">
        <h2>Select Department</h2>
        <select
          onChange={handleDepartmentChange}
          value={selectedDepartment || ""}
        >
          <option value="" disabled>
            Select Department
          </option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>

        {/* Display department details */}
        {selectedDept ? (
          <div className="scheme-form-div">
            <DepartmentCard
              title={selectedDept.name}
              des={selectedDept.tagline}
              image={selectedDept.image}
            />
          </div>
        ) : (
          <p>Please select a department to view details.</p>
        )}

        {/* Scheme Name and Budget Fields - Editable */}
        <div className="scheme-default-input">
          <div className="scheme-name">
            <input
              type="text"
              name="schemeName"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)} // Update Scheme Name
              placeholder="Enter Scheme Name"
              required
            />
          </div>
          <div className="scheme-budget">
            <input
              type="number"
              name="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)} // Update Budget
              placeholder="Enter Budget Scheme"
              required
            />
          </div>
        </div>

        {/* Add Custom Fields */}
        {/* Render Custom Fields */}
        {departmentFields.map((field, index) => (
          <div key={index} className="scheme-custom-field">
            <label>Field Label:</label>
            <input
              type="text"
              name="label"
              value={field.label}
              onChange={(e) => handleFieldChange(e, index)}
              placeholder="Field Label"
            />
            <label>Field Name:</label>
            <input
              type="text"
              name="name"
              value={field.name}
              onChange={(e) => handleFieldChange(e, index)}
              placeholder="Field Name"
            />
            <label>Field Type:</label>
            <select
              name="type"
              value={field.type}
              onChange={(e) => handleFieldChange(e, index)}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="image">Image</option> {/* Added Image option */}
              <option value="radio">Radio</option> {/* Added Radio option */}
            </select>

            {/* Render options for radio type fields */}
            {field.type === "radio" && (
              <div>
                <label>Radio Options:</label>
                {field.options.map((option, optionIndex) => (
                  <div key={optionIndex}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleRadioOptionChange(e, index, optionIndex)
                      }
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                  </div>
                ))}
                <button type="button" onClick={() => addRadioOption(index)}>
                  Add Option
                </button>
              </div>
            )}

            <button
              className="scheme-button"
              onClick={() => removeField(index)}
            >
              Remove
            </button>
          </div>
        ))}

        <button className="scheme-button" onClick={addField}>
          Add Custom Field
        </button>
      </div>

      {/* Display the final form template (for visualization) */}
      <div className="scheme-form-preview">
        <h3>Scheme Template Preview</h3>

        {/* Table for Scheme Name and Budget */}
        <table className="preview-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Scheme Name</td>
              <td>Text</td>
              <td>schemeName</td>
            </tr>
            <tr>
              <td>Budget</td>
              <td>Number</td>
              <td>budget</td>
            </tr>

            {/* Render custom fields in the table */}
            {departmentFields.map((field, index) => (
              <tr key={index}>
                <td>{field.label}</td>
                <td>{field.type}</td>
                <td>{field.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="scheme-button" type="button">
        Save Scheme Template
      </button>
    </div>
  );
};

export default CreateScheme;
