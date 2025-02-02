import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DepartmentCard from "./DepartmentCard";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

const UpdateScheme = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentFields, setDepartmentFields] = useState([]);
  const [schemeName, setSchemeName] = useState("");
  const [budget, setBudget] = useState("");
  const [amountPerUser, setAmountPerUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [specialRequirement, setSpecialRequirement] = useState("");
  const { departments } = useSelector((state) => state.departments);
  const location = useLocation();
  const { schemeId } = location.state;

  const fetchSchemeData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin/get-single-scheme/${schemeId}`
      );

      console.log(response);
      if (response.status === 200) {
        const data = response.data.schemeData;
        setSchemeName(data.schemeName);
        setBudget(data.budget);
        setAmountPerUser(data.amountPerUser);
        setMaxAge(data.maxAge);
        setMinAge(data.minAge);
        setSelectedDepartment(data.departmentID);
        setSpecialRequirement(data.specialRequirement);
        setDepartmentFields(data.form);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const selectedDept = departments.find(
    (dept) => dept._id === selectedDepartment
  );

  const handleFieldChange = (e, index) => {
    const { name, value } = e.target;
    const updatedFields = [...departmentFields];
    updatedFields[index][name] = value;
    setDepartmentFields(updatedFields);
  };

  const addField = () => {
    setDepartmentFields([
      ...departmentFields,
      { label: "", uniqueName: "", type: "text", options: [], _id: "" },
    ]);
  };

  const removeField = (index) => {
    setDepartmentFields(departmentFields.filter((_, i) => i !== index));
  };

  const addRadioOption = (index) => {
    const updatedFields = [...departmentFields];
    updatedFields[index].options.push("");
    setDepartmentFields(updatedFields);
  };

  const handleRadioOptionChange = (e, fieldIndex, optionIndex) => {
    const { value } = e.target;
    const updatedFields = [...departmentFields];
    updatedFields[fieldIndex].options[optionIndex] = value;
    setDepartmentFields(updatedFields);
  };

  useEffect(() => {
    fetchSchemeData();
  }, []);

  if (!schemeName || !budget || !amountPerUser) {
    return <div style={{ marginTop: "100px" }}>Loading...</div>; // Loading state until the data is ready
  }
  const HandleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedDepartment || !schemeName || !budget || !amountPerUser) {
      toast.error("Please fill all required fields!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formTemplate = departmentFields.map((field) => ({
        label: field.label,
        uniqueName: field.uniqueName,
        type: field.type,
        options: field.type === "radio" ? field.options : undefined,
        id: field._id,
      }));

      const payload = {
        departmentID: selectedDepartment,
        schemeName,
        budget,
        amountPerUser,
        maxAge,
        minAge,
        specialRequirement,
        form: formTemplate,
      };

      const response = await axios.put(
        `http://localhost:5000/api/v1/admin/update-scheme/${schemeId}`,
        payload,
        { withCredentials: true }
      );

      // console.log(response);

      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred while saving!"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
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
              <option key={department._id} value={department._id}>
                {department.departmentName}
              </option>
            ))}
          </select>

          {selectedDept ? (
            <div className="scheme-form-div">
              <DepartmentCard
                key={selectedDept._id}
                title={selectedDept.departmentName}
                des={selectedDept.des}
                image={selectedDept.image}
              />
            </div>
          ) : (
            <p style={{ color: "red" }}>
              Please select a department to view details.
            </p>
          )}

          <div className="scheme-default-input">
            <div className="scheme-name scheme-input-box">
              <label htmlFor="schemeName">Scheme Name:</label>
              <input
                className="scheme-input"
                type="text"
                name="schemeName"
                value={schemeName}
                onChange={(e) => setSchemeName(e.target.value)}
                placeholder="Enter Scheme Name"
                required
                id="schemeName"
              />
            </div>
            <div className="scheme-budget scheme-input-box">
              <label htmlFor="scheme-budget">Scheme Budget:</label>
              <input
                className="scheme-input"
                type="number"
                name="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Enter Budget Scheme"
                required
                id="scheme-budget"
              />
            </div>
            <div className="scheme-amount-per-user scheme-input-box">
              <label htmlFor="amount-per-user">Amount Per User:</label>
              <input
                className="scheme-input"
                type="number"
                name="amountPerUser"
                value={amountPerUser}
                onChange={(e) => setAmountPerUser(e.target.value)}
                placeholder="Enter Amount Per User"
                required
                id="amount-per-user"
              />
            </div>

            <div className="scheme-minAge scheme-input-box">
              <label htmlFor="minAge">Minimum Age:</label>
              <input
                className="scheme-input"
                type="number"
                name="minAge"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                placeholder="Enter Minimum Age eligible"
                required
                id="minAge"
              />
            </div>
            <div className="scheme-maxAge scheme-input-box">
              <label htmlFor="maxAge">Maximum Age:</label>
              <input
                className="scheme-input"
                type="number"
                name="maxAge"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                placeholder="Enter Maximum Age eligible"
                required
                id="maxAge"
              />
            </div>
          </div>

          <div className="scheme-special-requirement">
            <label htmlFor="special-Requirement">Special Requirements:</label>
            <textarea
              className="scheme-input"
              name="specialRequirement"
              value={specialRequirement}
              onChange={(e) => setSpecialRequirement(e.target.value)}
              placeholder="Enter the Special Requirement if needed"
              required
              id="special-Requirement"
              rows={5}
              cols={100}
            />
          </div>

          {departmentFields.map((field, index) => (
            <div key={index} className="scheme-custom-field">
              <input type="text" name="_id" value={field._id} hidden />
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
                name="uniqueName"
                value={field.uniqueName}
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
                <option value="image">Image</option>
                <option value="radio">Radio</option>
              </select>

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
                  <button
                    type="button"
                    className="scheme-button"
                    onClick={() => addRadioOption(index)}
                  >
                    Add Option
                  </button>
                </div>
              )}

              <button
                type="button"
                className="scheme-button"
                onClick={() => removeField(index)}
              >
                Remove Field
              </button>
            </div>
          ))}
          <button type="button" className="scheme-button" onClick={addField}>
            Add Field
          </button>

          <div className="form-actions">
            <button
              className="scheme-button"
              type="submit"
              onClick={HandleUpdate}
            >
              Update Scheme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateScheme;
