import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ethers } from "ethers";

// ✅ Import ABIs
import newTempAbi from "../../../Blockchain/artifacts/Contracts/newTempTokenContract.sol/MyToken.json";

// ✅ Contract Addresses
const newTempContract_Address = "0x43Dd8A1a3fB1788bfC9303e68626DBd06b06790C";
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

const ViewPendingContract = () => {
  const [contracts, setContracts] = useState([]);
  const sender = useSelector((state) => state.user?.user?.walletAddress);

  /** ✅ Fetch pending contracts */
  const getPendingContract = useCallback(async () => {
    try {
      console.log("Fetching pending contracts...");
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

  /** ✅ Connect Wallet */
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

  /** ✅ Approve contract & transfer funds */
  const ApproveContract = async (creator, contract_id, budget) => {
    try {
      console.log("🔹 Approving contract:", { creator, contract_id, budget });

      // ✅ Step 1: Fetch receiver wallet address
      const { data, status } = await axios.get(
        `http://localhost:5000/api/v1/user/getWalleteId/${creator}`
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
      const amountToSend = ethers.parseUnits(budget.toString(), 18);
      console.log("🔸 Amount to Send:", amountToSend.toString());

      // ✅ Step 5: Execute transfer
      let tx;
      try {
        tx = await contract.transfer(receiver, amountToSend);
        console.log("⏳ Transaction Pending...");
        await tx.wait();
        console.log("✅ Tokens Sent Successfully!");
      } catch (txError) {
        console.error("❌ Transaction failed:", txError);
        toast.error(txError.reason || txError.message || "Transaction failed!");
        return;
      }

      // ✅ Step 6: Update contract status in DB
      const dbResponse = await axios.post(
        "http://localhost:5000/api/v1/admin/approvedContract",
        { contractId: contract_id },
        { withCredentials: true }
      );

      if (dbResponse.status !== 200) {
        toast.error("❌ Failed to update contract approval in DB!");
        return;
      }

      console.log("✅ Contract marked as approved in DB.");
      toast.success("🎉 Contract approved successfully!");
      getPendingContract(); // Refresh pending contract list
    } catch (error) {
      console.error("❌ Unexpected Error:", error);
      toast.error("🚨 Unexpected error occurred. Please try again.");
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
                  <button
                    className="apply-button"
                    onClick={() =>
                      ApproveContract(
                        contract.creator,
                        contract._id,
                        contract.budget
                      )
                    }
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No Pending contracts found for the state.</p>
      )}
    </div>
  );
};

export default ViewPendingContract;
