import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "../style/ViewContracts.css"; // Import the CSS file
import Modal from "./Modal";
import { toast } from "react-toastify";

const ViewContracts = () => {
  const [selectedDepartment, setSelecetdDepartment] = useState("");
  const [contracts, setContracts] = useState([]);
  const [file, setFile] = useState(0);
  const [budget, setBudget] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const userId = useSelector((state) => state.user?.user?.id);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const { departments } = useSelector((state) => state.departments);

  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;
    setSelecetdDepartment(departmentId);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin/get-contract-by-department/${departmentId}`,
        { withCredentials: true }
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

  const handleApply = async (contractId) => {
    setLoading(true);
    // console.log(userId, file, budget, contractId);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("budget", budget);
    formData.append("contractId", contractId);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/user/fill-tender/${userId}`,
        formData,
        { withCredentials: true }
      );

      if (response.status == 200) {
        toast.success(response.data.message);
      }

      console.log(response);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const handleApplyInputChange = (e) => {
    if (e.target.name == "Tender-pdf") {
      setFile(e.target.files[0]);
    } else if (e.target.name == "Tender-budget") {
      setBudget(e.target.value);
    }
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
                    <button className="apply-button" onClick={openModal}>
                      Apply
                    </button>

                    {isModalOpen && (
                      <Modal closeModal={closeModal}>
                        <h1>Apply for contract</h1>
                        <div>
                          <label htmlFor="pdf-file">
                            Choose the Tender pdf (currently choose image) :
                          </label>
                          <input
                            type="file"
                            id="pdf-file"
                            onChange={handleApplyInputChange}
                            name="Tender-pdf"
                          />
                        </div>
                        <div>
                          <label htmlFor="budget"> Budget :</label>
                          <input
                            type="number"
                            id="budget"
                            value={budget}
                            onChange={handleApplyInputChange}
                            name="Tender-budget"
                          />
                        </div>

                        {loading ? (
                          <button>submitting.... wait</button>
                        ) : (
                          <button
                            onClick={() => {
                              handleApply(contract._id);
                            }}
                          >
                            Submit Tender
                          </button>
                        )}
                      </Modal>
                    )}
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
