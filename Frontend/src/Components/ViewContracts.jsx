import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "./Modal";
import "../style/ViewContracts.css";

const ViewContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [file, setFile] = useState(null);
  const [budget, setBudget] = useState(0);
  const [secreteKey, setSecreteKey] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = useSelector((state) => state.user?.user?.id);
  const location = useLocation();
  const state = location.state;

  useEffect(() => {
    if (state) {
      getContract();
    }
  }, [state]);

  const getContract = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/user/getContractByState/${state}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        setContracts(response.data.data);
      } else {
        console.error("Failed to fetch contracts");
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
    }
  };

  const handleApply = async () => {
    if (!file || !budget || !secreteKey) {
      toast.error("Please fill all fields before submitting.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("budget", budget);
    formData.append("contractId", selectedContractId);
    formData.append("secreteKey", secreteKey);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/user/fill-tender/${userId}`,
        formData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success(response.data.message);
        closeModal();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error submitting tender.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (contractId) => {
    setSelectedContractId(contractId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFile(null);
    setBudget(0);
    setSecreteKey("");
    setSelectedContractId(null);
  };

  const handleApplyInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "Tender-pdf" && files.length) {
      setFile(files[0]);
    } else if (name === "Tender-budget") {
      setBudget(value);
    } else if (name === "secreteKey") {
      setSecreteKey(value);
    }
  };

  return (
    <div className="view-container-top-div">
      <div className="view-contracts-container">
        {contracts.length > 0 ? (
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
                      onClick={() => openModal(contract._id)}
                    >
                      Apply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No contracts found for the state</p>
        )}
      </div>

      {isModalOpen && (
        <Modal closeModal={closeModal}>
          <h2>Apply for Contract</h2>
          <div>
            <label htmlFor="pdf-file">Choose the Tender PDF:</label>
            <input
              type="file"
              id="pdf-file"
              name="Tender-pdf"
              onChange={handleApplyInputChange}
            />
          </div>
          <div>
            <label htmlFor="budget">Budget:</label>
            <input
              type="number"
              id="budget"
              name="Tender-budget"
              value={budget}
              onChange={handleApplyInputChange}
            />
          </div>
          <div>
            <label htmlFor="secreteKey">Enter the Secret Key:</label>
            <input
              type="text"
              id="secreteKey"
              name="secreteKey"
              value={secreteKey}
              onChange={handleApplyInputChange}
            />
          </div>
          <button onClick={handleApply} disabled={loading}>
            {loading ? "Submitting..." : "Submit Tender"}
          </button>
        </Modal>
      )}
    </div>
  );
};

export default ViewContracts;
