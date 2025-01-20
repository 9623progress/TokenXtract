import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "../style/ViewContracts.css"; // Import the CSS file

const ViewContracts = () => {
  const [selectedDepartment, setSelecetdDepartment] = useState("");
  const [contracts, setContracts] = useState([]);

  const { departments } = useSelector((state) => state.departments);

  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;
    setSelecetdDepartment(departmentId);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin/get-contract-by-department/${departmentId}`
      );

      console.log(response);
      if (response.status === 200) {
        setContracts(response.data);
      } else {
        console.error("Failed to fetch contracts");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleApply = (contractId) => {
    // Handle the apply action here
    console.log(`Applied for contract ID: ${contractId}`);
  };

  return (
    <div className="view-container-top-div">
      <div className="view-contracts-container">
        <select
          className="department-select"
          onChange={handleDepartmentChange}
          value={selectedDepartment || ""}
        >
          <option value="" disabled>
            Select Department
          </option>
          {departments &&
            departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.departmentName}
              </option>
            ))}
        </select>

        {contracts && contracts.length > 0 ? (
          <table className="contracts-table">
            <thead>
              <tr>
                <th>Contract Name</th>
                <th>Budget</th>
                <th>State</th>
                <th>District</th>
                <th>City</th>
                <th>Local Address</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Legal Rules</th>
                <th>Stages</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract._id}>
                  <td>{contract.contractName}</td>
                  <td>{contract.budget}</td>
                  <td>{contract.state}</td>
                  <td>{contract.district}</td>
                  <td>{contract.city}</td>
                  <td>{contract.localAddress}</td>
                  <td>{contract.startDate}</td>
                  <td>{contract.endDate}</td>
                  <td>{contract.legalRules}</td>
                  <td>
                    <ul>
                      {contract.stages.map((stage, index) => (
                        <li key={index}>
                          {stage.stageName} - {stage.percentage}%
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <button
                      className="apply-button"
                      onClick={() => handleApply(contract._id)}
                    >
                      Apply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No contracts found for the selected department.</p>
        )}
      </div>
    </div>
  );
};

export default ViewContracts;
