import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

const GetMyApprovedContract = () => {
  const userId = useSelector((state) => state.user?.user?.id);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStages, setSelectedStages] = useState(null);
  const [contractId, setContractId] = useState(null);

  // Fetch approved contracts
  useEffect(() => {
    const fetchContracts = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/admin/getMyApprovedContract/${userId}`
        );
        setContracts(response.data.data);
      } catch (err) {
        setError("Failed to load contracts");
        console.error("Error fetching contracts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [userId]);

  // Show Stages of a Contract
  const handleShowStages = (stages, conId) => {
    setSelectedStages(stages);
    setContractId(conId);
  };

  // Approve a Stage
  const handleApproveStage = async (
    contractStageId,
    proof,
    budget,
    percentage
  ) => {
    const tokenAmount = (budget * percentage) / 100;
    //implement the logic of metamsk token transfer and get transaction id
    const transactionId = "";
    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/admin/approveStage/`,
        { contractId, contractStageId, proof, transactionId }
      );
      toast.success(response.data.message || "Stage approved successfully!");

      // Update the UI after stage approval
      setSelectedStages((prevStages) =>
        prevStages.map((stage) =>
          stage._id === contractStageId ? { ...stage, approve: true } : stage
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "approval fail");
      console.error("Error approving stage:", err);
    }
  };

  return (
    <div className="container" style={{ margin: "10px 70px" }}>
      <h2>My Approved Contracts</h2>
      {loading && <p>Loading contracts...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && contracts.length === 0 && (
        <p>No approved contracts found.</p>
      )}

      {!loading && contracts.length > 0 && (
        <table border="1" style={{ width: "100%", textAlign: "left" }}>
          <thead>
            <tr>
              <th>Contract Name</th>
              <th>Budget</th>
              <th>Location</th>
              <th>Contractor</th>

              <th>View Stages</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => (
              <tr key={contract._id}>
                <td>{contract.contractName}</td>
                <td>{contract.budget}</td>
                <td>
                  {contract.city}, {contract.state}
                </td>
                <td>
                  {contract.contractor
                    ? contract.contractor.name
                    : "Not Assigned"}
                </td>

                <td>
                  <button
                    onClick={() =>
                      handleShowStages(contract.stages, contract._id)
                    }
                    style={{ marginLeft: "10px" }}
                  >
                    Stages
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Stages Modal */}
      {selectedStages && (
        <div className="modal">
          <h3>Contract Stages</h3>
          <table border="1" style={{ width: "100%", textAlign: "left" }}>
            <thead>
              <tr>
                <th>Stage</th>
                <th>Percentage</th>
                <th>Proof</th>
                <th>Approval</th>
              </tr>
            </thead>
            <tbody>
              {selectedStages.map((stage) => (
                <tr key={stage._id}>
                  <td>{stage.stageName}</td>
                  <td>{stage.percentage}%</td>
                  <td>
                    {stage.proof ? (
                      <a
                        href={stage.proof}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Proof
                      </a>
                    ) : (
                      <span>Yet to Upload</span>
                    )}
                  </td>
                  <td>
                    {stage.approve ? (
                      <span>✅ Approved</span>
                    ) : (
                      <button
                        onClick={() =>
                          handleApproveStage(
                            stage._id,
                            stage.proof,
                            stage.budget,
                            stage.percentage
                          )
                        }
                      >
                        Approve Stage
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setSelectedStages(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default GetMyApprovedContract;
