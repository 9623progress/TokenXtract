import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DepartmentCard from "./DepartmentCard";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import "../style/UpdatedScheme.css";

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
    <div className="update-scheme">
      <div className="update-scheme__form-wrapper">
        <h2 className="update-tittle">Update Form of {schemeName}</h2>
        <div className="update-scheme__form">
          <div className="update-scheme__inputs">
            <div className="update-scheme__input-group">
              <label htmlFor="schemeName">Scheme Name:</label>
              <input
                className="update-scheme__input"
                type="text"
                name="schemeName"
                value={schemeName}
                onChange={(e) => setSchemeName(e.target.value)}
                placeholder="Enter Scheme Name"
                required
                id="schemeName"
              />
            </div>
            <div className="update-scheme__input-group">
              <label htmlFor="scheme-budget">Scheme Budget:</label>
              <input
                className="update-scheme__input"
                type="number"
                name="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Enter Budget Scheme"
                required
                id="scheme-budget"
              />
            </div>
            <div className="update-scheme__input-group">
              <label htmlFor="amount-per-user">Amount Per User:</label>
              <input
                className="update-scheme__input"
                type="number"
                name="amountPerUser"
                value={amountPerUser}
                onChange={(e) => setAmountPerUser(e.target.value)}
                placeholder="Enter Amount Per User"
                required
                id="amount-per-user"
              />
            </div>

            <div className="update-scheme__input-group">
              <label htmlFor="minAge">Minimum Age:</label>
              <input
                className="update-scheme__input"
                type="number"
                name="minAge"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                placeholder="Enter Minimum Age eligible"
                required
                id="minAge"
              />
            </div>
            <div className="update-scheme__input-group">
              <label htmlFor="maxAge">Maximum Age:</label>
              <input
                className="update-scheme__input"
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

          <div className="update-scheme__textarea-group">
            <label htmlFor="special-Requirement">Special Requirements:</label>
            <textarea
              className="update-scheme__textarea"
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
            <div key={index} className="update-scheme__custom-field">
              <input type="text" name="_id" value={field._id} hidden />
              <label>Field Label:</label>
              <input
                className="update-scheme__input"
                type="text"
                name="label"
                value={field.label}
                onChange={(e) => handleFieldChange(e, index)}
                placeholder="Field Label"
              />
              <label>Field Name:</label>
              <input
                className="update-scheme__input"
                type="text"
                name="uniqueName"
                value={field.uniqueName}
                onChange={(e) => handleFieldChange(e, index)}
                placeholder="Field Name"
              />
              <label>Field Type:</label>
              <select
                className="update-scheme__select"
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
                <div className="update-scheme__radio-group">
                  <label>Radio Options:</label>
                  {field.options.map((option, optionIndex) => (
                    <div key={optionIndex}>
                      <input
                        className="update-scheme__input"
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
                    className="update-scheme__button"
                    onClick={() => addRadioOption(index)}
                  >
                    Add Option
                  </button>
                </div>
              )}

              <button
                type="button"
                className="update-scheme__button"
                onClick={() => removeField(index)}
              >
                Remove Field
              </button>
            </div>
          ))}

          <button
            type="button"
            className="update-scheme__button update-scheme__button--add"
            onClick={addField}
          >
            Add Field
          </button>

          <div className="update-scheme__actions">
            <button
              className="update-scheme__button update-scheme__button--submit"
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
