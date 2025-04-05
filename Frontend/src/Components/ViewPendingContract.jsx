import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import '../style/ViewPendingContract.css';

const shivaniAddress = "0x9e6DEFb65e5a0c0C6Fa0eAF11CAFd05D31c5e328";

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

const ViewPendingContract = () => {
  const [contracts, setContracts] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [selectedApproveContract, setSelectedApproveContract] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const sender = useSelector((state) => state.user?.user?.walletAddress);

  const getPendingContract = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/admin/getPendingContract"
      );
      if (response.status === 200) {
        setContracts(response.data.data);
      } else {
        toast.error("Failed to fetch contracts!");
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast.error("Failed to fetch pending contracts.");
    }
  }, []);

  useEffect(() => {
    getPendingContract();
  }, [getPendingContract]);

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

  const handleApproveContract = async () => {
    if (!selectedApproveContract) return;

    const { _id, budget, creator } = selectedApproveContract;

    if (!creator || !creator.walletAddress) {
      toast.error("❌ Creator's wallet address not found!");
      return;
    }

    const receiver = creator.walletAddress.trim();

    if (!ethers.isAddress(receiver)) {
      toast.error("❌ Invalid receiver address!");
      return;
    }

    const signer = await connectWallet();
    if (!signer) return;

    const contract = new ethers.Contract(shivaniAddress, shivaniAbi, signer);
    const amountToSend = ethers.parseUnits(budget.toString(), 18);

    let tx;
    try {
      tx = await contract.transfer(receiver, amountToSend);
      await tx.wait();
      console.log("✅ Tokens Sent Successfully!");
    } catch (txError) {
      console.error("❌ Transaction failed:", txError);
      toast.error("Network full, please try again");
      return;
    }

    try {
      const dbResponse = await axios.post(
        "http://localhost:5000/api/v1/admin/approvedContract",
        { contractId: _id },
        { withCredentials: true }
      );

      if (dbResponse.status !== 200) {
        toast.error("❌ Failed to update contract approval in DB!");
        return;
      }

      toast.success("🎉 Contract approved successfully!");
      setShowApproveModal(false);
      setSelectedApproveContract(null);
      getPendingContract();
    } catch (error) {
      console.error("❌ Unexpected Error:", error);
      toast.error("🚨 Unexpected error occurred. Please try again.");
    }
  };

  const handleRejectContract = async () => {
    if (!selectedContractId || rejectionReason.trim() === "") {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/v1/admin/rejectContract",
        {
          contractId: selectedContractId,
          reason: rejectionReason,
        },
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success("Contract rejected successfully!");
        setShowRejectModal(false);
        setSelectedContractId(null);
        setRejectionReason("");
        getPendingContract();
      } else {
        toast.error("Failed to reject contract.");
      }
    } catch (err) {
      console.error("Reject contract error:", err);
      toast.error("Server error while rejecting contract.");
    }
  };

  return (
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
                    {contract.stages?.map((stage, index) => (
                      <li key={index}>
                        {stage.stageName} - {stage.percentage}%
                      </li>
                    )) || "No stages"}
                  </ul>
                </td>
                <td>
                  <ul>
                    <button
                      className="apply-button"
                      onClick={() => {
                        setSelectedApproveContract(contract);
                        setShowApproveModal(true);
                      }}
                    >
                      Approve
                    </button>
                    <button
                      className="apply-button"
                      onClick={() => {
                        setSelectedContractId(contract._id);
                        setShowRejectModal(true);
                      }}
                    >
                      Reject
                    </button>
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No Pending contracts found for the state.</p>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
  <div className="reject-modal-overlay">
    <div className="reject-modal-box">
      <h2>Reject Contract</h2>
      <textarea
        rows={4}
        placeholder="Enter reason for rejection"
        value={rejectionReason}
        onChange={(e) => setRejectionReason(e.target.value)}
      ></textarea>
      <div className="modal-actions">
        <button onClick={() => setShowRejectModal(false)}>Cancel</button>
        <button onClick={handleRejectContract}>Reject</button>
      </div>
    </div>
  </div>
)}


      {/* Approve Modal */}
      {showApproveModal && selectedApproveContract && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-md w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Approve Contract</h2>
            <p className="mb-4">
              Are you sure you want to approve contract:{" "}
              <strong>{selectedApproveContract.contractName}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-1 border rounded"
                onClick={() => setShowApproveModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-1 rounded"
                onClick={handleApproveContract}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPendingContract;
