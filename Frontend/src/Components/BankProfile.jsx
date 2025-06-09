import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import {
  tokenAddress,
  tokenABI,
  fetchTokenBalance,
  getMoney,
  updateMoneyInBackend,
} from "../utils/UniversalTokenData";
import { useSelector } from "react-redux";
import axios from "axios";

const BankProfile = () => {
  const centralGov = "0x08Ce9BFb1707baC98492A7aD4E3A1839aa6a856a";
  const [tokenAmount, setTokenAmount] = useState(0);
  const [balance, setBalance] = useState("0.0");
  const [money, setMoney] = useState(0);

  const bankAddress = useSelector((state) => state.user?.user?.walletAddress);
  const id = useSelector((state) => state.user?.user?.id);

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

  const handleSendToken = async () => {
    try {
      const signer = await connectWallet();
      if (!signer) return;

      const contract = new ethers.Contract(tokenAddress, tokenABI, signer);
      const amountToSend = ethers.parseUnits(tokenAmount.toString(), 18);

      const tx = await contract.transfer(centralGov, amountToSend);
      await tx.wait();
      toast.success("✅ Token sent successfully on blockchain!");

      // ✅ Try to update backend
      await updateMoneyInBackend(id, tokenAmount);
      const Money = await getMoney(id);
      setMoney(Money);
      // ✅ Refresh balance
      const updatedBalance = await fetchTokenBalance(bankAddress);
      setBalance(updatedBalance);
      setTokenAmount(0);
    } catch (error) {
      console.error("❌ Send Token Error:", error);
      toast.error("Transaction failed. Please try again.");
    }
  };

  useEffect(() => {
    const getBalance = async () => {
      try {
        const Money = await getMoney(id);
        setMoney(Money);
        const balance = await fetchTokenBalance(bankAddress);
        console.log(balance);
        if (!balance) {
          toast.error("Unable to fetch token balance");
        } else {
          setBalance(balance);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        toast.error("Error fetching token balance");
      }
    };

    if (bankAddress) getBalance();
  }, [bankAddress]);

  return (
    <div className="create-token-top-div">
      <h1 style={{ textAlign: "center" }}>Bank Profile</h1>
      <div className="create-token-box">
        <div className="create-token-input">
          <label>Current Money (Rupees):</label>
          <input type="text" value={` Rs. ${money} `} readOnly />
        </div>
        <div className="create-token-input">
          <label>Current Token Balance:</label>
          <input type="text" value={`${balance} GFT`} readOnly />
        </div>

        <div className="create-token-input">
          <label htmlFor="create-token">Enter Token Amount (in Rs):</label>
          <input
            id="create-token"
            type="number"
            placeholder="Enter Amount in Rs"
            value={tokenAmount}
            onChange={handleInputChange}
            min="1"
          />
        </div>

        <button className="create-token-button" onClick={handleSendToken}>
          Send Token to Central Government
        </button>
      </div>
    </div>
  );
};

export default BankProfile;
