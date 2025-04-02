import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

import { ethers } from "ethers";

const GetMyApprovedContract = () => {
  const userId = useSelector((state) => state.user?.user?.id);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStages, setSelectedStages] = useState(null);
  const [contractId, setContractId] = useState(null);
  const [contractorID, setContractorID] = useState("");
  const [budget, setBudget] = useState(0);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("🚨 MetaMask not installed! Please install and try again.");
      return null;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      return await provider.getSigner();
    } catch (error) {
      console.error("❌ Wallet connection failed:", error);
      toast.error("❌ Failed to connect wallet!");
      return null;
    }
  };

  const shivaniAddress = "0x9e6DEFb65e5a0c0C6Fa0eAF11CAFd05D31c5e328";

  // ✅ Shivani Token ABI (Minimal)
  const shivaniAbi = [
    {
      inputs: [
        { internalType: "address", name: "recipient", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

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
  const handleShowStages = (stages, conId, contractor_id, budget) => {
    setSelectedStages(stages);
    setContractId(conId);
    setContractorID(contractor_id);
    setBudget(budget);
  };

  // Approve a Stage
  const handleApproveStage = async (contractStageId, proof, percentage) => {
    const tokenAmount = (budget * percentage) / 100;
    //implement the logic of metamsk token transfer and get transaction id
    console.log(budget, percentage);
    console.log(tokenAmount);

    const { data, status } = await axios.get(
      `http://localhost:5000/api/v1/user/getWalleteId/${contractorID}`
    );

    if (status !== 200 || !data.walletAddress) {
      toast.error("❌ Receiver wallet address not found!");
      return;
    }

    const receiver = data.walletAddress.trim(); // Ensure no spaces
    console.log("✅ Receiver Wallet:", receiver);

    if (!ethers.isAddress(receiver)) {
      toast.error("❌ Invalid receiver address!");
      return;
    }

    // ✅ Step 2: Connect Wallet
    const signer = await connectWallet();
    if (!signer) return;

    // ✅ Step 3: Get contract instance
    const contract = new ethers.Contract(shivaniAddress, shivaniAbi, signer);
    console.log("✅ Contract Instance Loaded:", contract);

    // ✅ Step 4: Convert budget to correct BigInt units
    const amountToSend = ethers.parseUnits(tokenAmount.toString(), 18);
    console.log("🔸 Amount to Send:", amountToSend.toString());

    
    const senderBalance = await contract.balanceOf(await signer.getAddress());
    console.log("Sender Balance:", senderBalance.toString());
    if (senderBalance < amountToSend) {
      toast.error("❌ Insufficient token balance!");
      return;
    }

    // ✅ Step 5: Execute transfer
    let tx;
    try {
      tx = await contract.transfer(receiver, amountToSend);
      console.log("⏳ Transaction Pending...");
      await tx.wait();
      console.log("✅ Tokens Sent Successfully!");
    } catch (txError) {
      console.error("❌ Transaction failed:", txError);
      // toast.error(txError.reason || txError.message || "Transaction failed!");
      toast.error("network full please try again");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/admin/approveStage/`,
        { contractId, contractStageId, proof }
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
                      handleShowStages(
                        contract.stages,
                        contract._id,
                        contract.contractor._id,
                        contract.budget
                      )
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
