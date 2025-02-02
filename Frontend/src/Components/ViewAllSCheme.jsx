import axios from "axios";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import "../style/ViewAllScheme.css";
import { formatSpecialRequirements } from "./textFormat";
import { useNavigate } from "react-router-dom";

const ViewAllSCheme = () => {
  const { departments } = useSelector((state) => state.departments);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [schemes, setSchemes] = useState("");
  const navigate = useNavigate();

  const HandleDepartmentChange = async (e) => {
    setSelectedDepartment(e.target.value);

    if (e.target.value != "") {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin//get-scheme/${e.target.value}`,
        { withCredentials: true }
      );

      if (response.status == 200) {
        setSchemes(response.data.schemes);
      }
    }
  };

  const HandleOnClick = (id, schemeName) => {
    navigate("/scheme-form", { state: { id, schemeName } });
  };

  const handleUpdateClick = (schemeId) => {
    console.log(schemeId);
    navigate("/update-scheme", { state: { schemeId } });
  };

  return (
    <div className="view-scheme-top-div">
      <select value={selectedDepartment} onChange={HandleDepartmentChange}>
        <option value="">Select Department</option>
        {departments &&
          departments.map((dep) => (
            <option key={dep._id} value={dep._id}>
              {dep.departmentName}
            </option>
          ))}
      </select>

      {selectedDepartment ? (
        <table>
          <thead className="table-head">
            <tr>
              <td>Sr. No.</td>
              <td>Department Name</td>
              <td>Scheme Name</td>
              <td>Budget</td>
              <td>Ammount Per User</td>
              <td>Min Age</td>
              <td>Max Age</td>
              <td>Special Requirement </td>
              <td>form</td>
              <td>Update</td>
              <td>Delete</td>
            </tr>
          </thead>
          <tbody>
            {schemes &&
              schemes.map((scheme, index) => (
                <tr key={scheme._id}>
                  <td>{index + 1}</td>
                  <td>{scheme.departmentID.departmentName}</td>
                  <td>{scheme.schemeName}</td>
                  <td>Rs. {scheme.budget.toLocaleString()} </td>
                  <td>Rs. {scheme.amountPerUser.toLocaleString()} </td>
                  <td>{scheme.minAge}</td>
                  <td>{scheme.maxAge}</td>
                  <td>
                    {formatSpecialRequirements(scheme.specialRequirement)}
                  </td>

                  <td>
                    <button
                      className="view-button view-form-button"
                      onClick={() => {
                        HandleOnClick(scheme._id, scheme.schemeName);
                      }}
                    >
                      form
                    </button>
                  </td>
                  <td>
                    <button
                      className="view-button view-update-button"
                      onClick={() => {
                        handleUpdateClick(scheme._id);
                      }}
                    >
                      Update
                    </button>
                  </td>
                  <td>
                    <button className="view-button view-action-button">
                      Action
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <p>Please Select Department</p>
      )}
    </div>
  );
};

export default ViewAllSCheme;
