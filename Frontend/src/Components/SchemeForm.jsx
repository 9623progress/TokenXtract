import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../style/schemeForm.css";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "./Loader";
import Modal from "./Modal.jsx";

const SchemeForm = () => {
  const location = useLocation();
  const { id, schemeName } = location.state;
  const [form, setForm] = useState([]);
  const [responses, setResponses] = useState([]); // To store user input
  const userID = useSelector((state) => state.user?.user?.id);
  const [loading, setloading] = useState(false);

  const fetch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/user/getForm/${id}`,
        { withCredentials: true }
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
    // if (!userID) {
    //   toast.error("Login Please");

    //   return;
    // }
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
      setloading(true);
      const res = await axios.post(
        "http://localhost:5000/api/v1/user/submit",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.status == 200) {
        toast.success(res.data.message);
      }

      console.log("Form submitted successfully", res.data);
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error submitting form", error);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  // if (loading) {
  //   return (
  //     <Modal>
  //       <Loader />
  //       <p>Wait form is submitting</p>
  //     </Modal>
  //   );
  // }

  return (
    <div className="form-top">
      <h1 className="form-heading">{`${schemeName} Application Form`}</h1>
      {form.length > 0 ? (
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

                {field.type === "date" && (
                  <input
                    type="date"
                    required={field.required}
                    onChange={(e) =>
                      handleInputChange(e, field._id, "date", field.uniqueName)
                    }
                    style={{ marginTop: "5px" }}
                  />
                )}
              </div>
            ))}
            {!loading ? (
              <button type="submit" className="scheme-form-submit">
                Submit
              </button>
            ) : (
              <button type="submit" className="scheme-form-submit">
                <Loader />
              </button>
            )}
          </form>
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default SchemeForm;
