import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../style/schemeForm.css";

const SchemeForm = () => {
  const location = useLocation();
  const { id } = location.state;
  const [form, setForm] = useState([]);
  const [formData, setFormData] = useState({}); // To store user input

  const fetch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/user/getForm/${id}`
      );
      if (response.status === 200) {
        setForm(response.data.form);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (e, fieldId) => {
    setFormData({ ...formData, [fieldId]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your submit logic here (e.g., send formData to server)
    console.log(formData);
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="form-top">
      <h1 className="form-heading">Scheme Application Form</h1>
      <div className="form-div">
        <form onSubmit={handleSubmit}>
          {form.map((field) => (
            <div key={field._id} style={{ marginBottom: "15px" }}>
              <label>{field.label} : </label>

              {/* Handle text input */}
              {field.type === "text" && (
                <input
                  type="text"
                  required={field.required}
                  value={formData[field._id] || ""}
                  onChange={(e) => handleInputChange(e, field._id)}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              )}

              {/* Handle radio (now dropdown) input */}
              {field.type === "radio" && (
                <select
                  required={field.required}
                  value={formData[field._id] || ""}
                  onChange={(e) => handleInputChange(e, field._id)}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {/* Handle image input */}
              {field.type === "image" && (
                <input
                  type="file"
                  accept="image/*"
                  required={field.required}
                  onChange={(e) => handleInputChange(e, field._id)}
                  style={{ marginTop: "5px" }}
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            style={{ padding: "10px 20px", cursor: "pointer" }}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default SchemeForm;
