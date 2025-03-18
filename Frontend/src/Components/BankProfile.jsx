import React, { useState } from "react";
import { toast } from "react-toastify";
import { ethers } from "ethers";

const BankProfile = () => {
  const centralGov = "0x08Ce9BFb1707baC98492A7aD4E3A1839aa6a856a";
  const [TokenAmount, setTokenAmount] = useState(0);
  const shivaniAddress = "0x9e6DEFb65e5a0c0C6Fa0eAF11CAFd05D31c5e328";

  const handleInputChange = (e) => {
    setTokenAmount(e.target.value);
  };
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
  const HandlesendToken = async () => {
    try {
      // ✅ Step 1: Fetch receiver wallet address

      // ✅ Step 2: Connect Wallet
      const signer = await connectWallet();
      if (!signer) return;

      // ✅ Step 3: Get contract instance
      const contract = new ethers.Contract(shivaniAddress, shivaniAbi, signer);
      console.log("✅ Contract Instance Loaded:", contract);

      // ✅ Step 4: Convert budget to correct BigInt units
      const amountToSend = ethers.parseUnits(TokenAmount.toString(), 18);
      console.log("🔸 Amount to Send:", amountToSend.toString());

      // ✅ Step 5: Execute transfer
      let tx;
      try {
        tx = await contract.transfer(centralGov, amountToSend);
        console.log("⏳ Transaction Pending...");
        await tx.wait();
        console.log("✅ Tokens Sent Successfully!");
        toast.success("Token Send Sucessfully");
      } catch (txError) {
        console.error("❌ Transaction failed:", txError);
        // toast.error(txError.reason || txError.message || "Transaction failed!");
        toast.error("network full please try again");
        return;
      }

      // ✅ Step 6: Update contract status in DB
    } catch (error) {
      console.error("❌ Unexpected Error:", error);
      toast.error("🚨 Unexpected error occurred. Please try again.");
    }
  };
  return (
    <div>
      <div className="create-token-top-div">
        <h1 style={{ textAlign: "center" }}>Bank Profile</h1>
        <div className="create-token-box">
          <div className="create-token-input">
            <label htmlFor="create-token">Enter Token Amount (in Rs): </label>
            <input
              id="create-token"
              type="number"
              placeholder="Enter Amount in Rs"
              value={TokenAmount}
              onChange={handleInputChange}
              min="1"
            />
          </div>
          <button className="create-token-button" onClick={HandlesendToken}>
            Send Token to Central Government
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankProfile;
