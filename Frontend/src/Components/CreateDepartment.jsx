import React, { useState } from "react";
import "../style/createDepartment.css";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "./Loader";

const CreateDepartment = () => {
  const [departmentName, setDeapartmentName] = useState("");
  const [des, setDes] = useState("");
  const [file, setFile] = useState("");
  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    document.getElementById("dep-hidden-button").click();
  };

  const handleOnChange = (e) => {
    if (e.target.name == "departemntName") {
      setDeapartmentName(e.target.value);
    } else if (e.target.name == "image") {
      setFile(e.target.files[0]);
    } else if (e.target.name == "des") {
      setDes(e.target.value);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("departmentName", departmentName);
      formData.append("image", file);
      formData.append("des", des);

      console.log(departmentName, file);

      const response = await axios.post(
        "http://localhost:5000/api/v1/admin/create-department",
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.status == 200) {
        toast.success(response.data.message);
        setDeapartmentName("");
        setDes("");
        setFile("");
      }

      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="department-top-div">
      <div>
        <div className="dep-form">
          <p className="dep-heading">Create Department</p>
          <input
            type="text"
            name="departemntName"
            placeholder="Enter Department Name"
            required
            value={departmentName}
            onChange={handleOnChange}
          />

          <input
            type="text"
            name="des"
            placeholder="Enter description"
            required
            value={des}
            onChange={handleOnChange}
          />

          <div>
            {/* <label htmlFor="image"> Choose department logo</label> */}
            <input
              style={{ display: "none" }}
              type="file"
              name="image"
              required
              id="dep-hidden-button"
              onChange={handleOnChange}
              // value={file}
            />
          </div>

          <button className="dep-button" onClick={handleClick}>
            Choose Department logo
          </button>
          {!loading ? (
            <button className="dep-button" onClick={handleSubmit}>
              submit
            </button>
          ) : (
            <button className="dep-button">
              <Loader />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateDepartment;
