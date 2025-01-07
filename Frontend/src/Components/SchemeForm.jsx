import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../style/schemeForm.css";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const SchemeForm = () => {
  const location = useLocation();
  const { id, schemeName } = location.state;
  const [form, setForm] = useState([]);
  const [responses, setResponses] = useState([]); // To store user input
  const userID = useSelector((state) => state.user.user.id);
  const [loading, setloading] = useState(false);

  const fetch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/user/getForm/${id}`
      );
      if (response.status === 200) {
        setForm(response.data.form);
      }
    } catch (error) {
      console.error("Error fetching form", error);
    }
  };

  const handleInputChange = (e, fieldId, inputType, uniqueName) => {
    const value = inputType === "file" ? e.target.files[0] : e.target.value;

    setResponses((prevResponses) => {
      // Update responses array by replacing or adding the current field's data
      const updatedResponses = prevResponses.filter(
        (response) => response.key !== fieldId
      );
      updatedResponses.push({
        key: fieldId,
        type: inputType,
        value,
        label: uniqueName,
      });
      return updatedResponses;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare FormData
    const formData = new FormData();
    formData.append("userID", userID);
    formData.append("schemeID", id);

    // Append each response to the FormData
    responses.forEach((response) => {
      if (response.type === "file") {
        formData.append(response.key, response.value); // File
      } else {
        formData.append(response.key, response.value); // Text
      }
    });

    try {
      const res = await axios.post(
        "http://localhost:5000/api/v1/user/submit",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.status == 200) {
        toast.success(res.data.message);
      }

      console.log("Form submitted successfully", res.data);
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="form-top">
      <h1 className="form-heading">{`${schemeName} Application Form`}</h1>
      <div className="form-div">
        <form onSubmit={handleSubmit}>
          {form.map((field) => (
            <div key={field._id} style={{ marginBottom: "15px" }}>
              <label>{field.label}:</label>

              {/* Handle text input */}
              {field.type === "text" && (
                <input
                  type="text"
                  required={field.required}
                  onChange={(e) =>
                    handleInputChange(e, field._id, "text", field.uniqueName)
                  }
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              )}

              {/* Handle radio (dropdown) input */}
              {field.type === "radio" && (
                <select
                  required={field.required}
                  onChange={(e) =>
                    handleInputChange(e, field._id, "text", field.uniqueName)
                  }
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

              {/* Handle file (image) input */}
              {field.type === "image" && (
                <input
                  type="file"
                  accept="image/*"
                  required={field.required}
                  onChange={(e) =>
                    handleInputChange(e, field._id, "file", field.uniqueName)
                  }
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
