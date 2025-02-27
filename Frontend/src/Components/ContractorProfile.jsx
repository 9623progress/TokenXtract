import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../style/ContractorProfile.css";
import Modal from "./Modal";
import { toast } from "react-toastify";

const ContractorProfile = () => {
  const user = useSelector((state) => state.user?.user);
  const [contractData, setContractData] = useState([]);
  const [selectedStages, setSelectedStages] = useState(null);
  const [budget, setBudget] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contractId, setContractId] = useState("");
  const [stageId, setStageId] = useState("");
  const [proofFile, setProofFile] = useState(null);

  const inputChange = (e) => {
    if (e.target.files.length > 0) {
      setProofFile(e.target.files[0]);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const uploadFile = async () => {
    try {
      if (!proofFile) {
        return toast.error("Please select a file");
      }

      const formData = new FormData();
      formData.append("contractId", contractId);
      formData.append("stageId", stageId);
      formData.append("file", proofFile);

      const response = await axios.post(
        "http://localhost:5000/api/v1/user/uploadStageProof",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success(response.data.message);
        closeModal();
        fetchMyAppliedContract();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error.response?.data?.message || "File upload failed");
    }
  };

  const handleStage = (id) => {
    setStageId(id);
    setIsModalOpen(true);
  };

  const fetchMyAppliedContract = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/user/myAppliedContracts/${user?.id}`
      );
      if (response.status === 200) {
        setContractData(response.data?.data?.AppliedContractApplication || []);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMyAppliedContract();
    }
  }, [user?.id]);

  const handleViewStages = (stages, budget, id) => {
    setSelectedStages(stages);
    setBudget(budget);
    setContractId(id);
  };

  return (
    <div className="contract-profile-containers">
      <div>
        <p>Name: {user?.name}</p>
        <p>Adhar Number: {user?.adhar}</p>
        <p>Role: {user?.role}</p>
        <p>Wallet Address: {user?.walletAddress}</p>
      </div>

      <div>
        <h1>Your Applied Contracts</h1>
        {contractData.length > 0 ? (
          <table border="1" cellPadding="5">
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contractData.map((contract) => (
                <tr key={contract._id}>
                  <td>{contract.contractId?.contractName}</td>
                  <td>{contract.contractId?.budget}</td>
                  <td>{contract.contractId?.state}</td>
                  <td>{contract.contractId?.district}</td>
                  <td>{contract.contractId?.city}</td>
                  <td>{contract.contractId?.localAddress}</td>
                  <td>{contract.contractId?.startDate}</td>
                  <td>{contract.contractId?.endDate}</td>
                  <td>{contract.contractId?.legalRules}</td>
                  <td>
                    <button
                      onClick={() =>
                        handleViewStages(
                          contract.contractId?.stages,
                          contract.contractId?.budget,
                          contract.contractId?._id
                        )
                      }
                    >
                      View Stages
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No contracts applied yet.</p>
        )}
      </div>

      {selectedStages && (
        <div>
          <h2>Stages</h2>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Stage Name</th>
                <th>Percentage</th>
                <th>Approval Status</th>
                <th>Proof</th>
                <th>Amount Send</th>
              </tr>
            </thead>
            <tbody>
              {selectedStages.map((stage) => (
                <tr key={stage._id}>
                  <td>{stage.stageName}</td>
                  <td>{stage.percentage}%</td>
                  <td>{stage.approve ? "Approved" : "Pending"}</td>
                  <td>
                    {(stage.proof && (
                      <a href={stage.proof} target="blank">
                        View proof
                      </a>
                    )) || (
                      <button
                        onClick={() => {
                          handleStage(stage._id);
                        }}
                      >
                        Request Fund
                      </button>
                    )}
                  </td>
                  <td>
                    {stage.approve
                      ? (budget * stage.percentage) / 100
                      : "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setSelectedStages(null)}>Close</button>
        </div>
      )}

      {isModalOpen && (
        <Modal closeModal={closeModal}>
          <label htmlFor="proof-file">Upload the work done details file</label>
          <input type="file" name="proof-file" onChange={inputChange} />
          <button onClick={uploadFile}>Submit</button>
        </Modal>
      )}
    </div>
  );
};

export default ContractorProfile;
