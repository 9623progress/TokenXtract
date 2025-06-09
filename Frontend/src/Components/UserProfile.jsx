import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../style/Profile.css";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "./Modal";
import { ethers } from "ethers";
import {
  fetchTokenBalance,
  tokenABI,
  tokenAddress,
  getMoney,
  updateMoneyInBackend,
} from "../utils/UniversalTokenData";

const UserProfile = () => {
  const [appliedSchemes, setAppliedSchemes] = useState([]);
  const [editingScheme, setEditingScheme] = useState(null);
  const [updatedResponses, setUpdatedResponses] = useState({});
  const [totalTokensReceived, setTotalTokensReceived] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewBanksModal, setViewBanksModal] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIFsc] = useState("");
  const [bank_id, setBank_id] = useState("");
  const [balance, setBalance] = useState(0);
  const [money, setMoney] = useState(0);
  const [banks, setBanks] = useState([]);
  const [tokenAmount, setTokenAmount] = useState(0);

  const user = useSelector((state) => state.user.user);

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

  const handleBankClick = () => {
    getBanks();
    setBanks(true);
    setViewBanksModal(true);
  };

  const firstFetch = async () => {
    try {
      const balance = await fetchTokenBalance(user.walletAddress);
      console.log(balance);
      if (!balance) {
        toast.error("Unable to fetch token balance");
      } else {
        setBalance(balance);
      }
      const Money = await getMoney(user.id);
      setMoney(Money);
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Error fetching token balance");
    }
  };

  const OpenBankModal = (bank_id) => {
    setIsBankModalOpen(true);
    setBank_id(bank_id);
  };

  const closeBankModal = () => {
    setIsBankModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const HanndleBankInputChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name == "account-no") {
      setAccountNo(value);
    } else if (name == "IFSC-code") {
      setIFsc(value);
    } else if (name == "token-Amount") {
      setTokenAmount(value);
    }
  };

  const getBanks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/user/getBanks"
      );
      if (response.status == 200) {
        console.log(response);
        setBanks(response.data.banks);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendTokenToBank = async () => {
    try {
      // ✅ Step 1: Fetch receiver wallet address
      const { data, status } = await axios.get(
        `http://localhost:5000/api/v1/user/getWalleteId/${bank_id}`
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
      const contract = new ethers.Contract(tokenAddress, tokenABI, signer);
      console.log("✅ Contract Instance Loaded:", contract);

      // ✅ Step 4: Convert budget to correct BigInt units
      const amountToSend = ethers.parseUnits(tokenAmount.toString(), 18);
      console.log("🔸 Amount to Send:", amountToSend.toString());

      // ✅ Step 5: Execute transfer
      let tx;
      try {
        tx = await contract.transfer(receiver, amountToSend);
        console.log("⏳ Transaction Pending...");
        await tx.wait();
        closeBankModal();
        console.log("✅ Tokens Sent Successfully!");
        toast.success("Token Send Sucessfully");

        // ✅ Try to update backend
        await updateMoneyInBackend(user.id, tokenAmount);
        const Money = await getMoney(user.id);
        setMoney(Money);
        // ✅ Refresh balance
        const updatedBalance = await fetchTokenBalance(user.walletAddress);
        setBalance(updatedBalance);
      } catch (error) {
        if (error.code === "CALL_EXCEPTION") {
          console.error("Revert reason:", error);
        } else {
          console.error("Other error:", error);
        }

        toast.error("network full please try again");
        return;
      }

      // ✅ Step 6: Update contract status in DB
    } catch (error) {
      console.error("❌ Unexpected Error:", error);
      toast.error("🚨 Unexpected error occurred. Please try again.");
    }
  };

  const closeViewBankModal = () => {
    setViewBanksModal(false);
  };

  if (!user) {
    return <p>Loading user data...</p>;
  }

  const firstLetter = user.name?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    fetchAppliedSchemes();
    calculateTokenStats();
    fetchTokenStats();
    firstFetch();
  }, [user]);

  const fetchTokenStats = async () => {
    try {
      console.log("Fetching token stats..."); // Debug log
      const response = await axios.get(
        "http://localhost:5000/api/v1/user/getTokenStats",
        { withCredentials: true }
      );

      console.log("Response received:", response.data); // Debug log

      if (response.data.success) {
        setTotalTokensReceived(response.data.totalTokensReceived);
      } else {
        console.error("Failed to fetch token stats:", response.data.message);
      }
    } catch (error) {
      console.error(
        "Error fetching token stats:",
        error.response?.data || error
      );
      // toast.error("Error fetching token stats");
    }
  };

  // Fetch on mount

  const fetchAppliedSchemes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/user/getMyAppliedSchemes",
        { withCredentials: true }
      );
      if (response.status === 200) {
        setAppliedSchemes(response.data.appliedSchemes);
      }
    } catch (error) {
      console.error("Error fetching applied schemes:", error);
      toast.error("Error fetching applied schemes");
    }
  };

  const calculateTokenStats = () => {
    if (!user.tokenHistory || user.tokenHistory.length === 0) {
      setTotalTokensReceived(0);
      // setCurrentTokenBalance(0);
      return;
    }

    let totalReceived = 0;
    // let currentBalance = 0;

    user.tokenHistory.forEach((txn) => {
      const amount = Number(txn.amount || 0);

      if (amount > 0) {
        totalReceived += amount;
      }

      // currentBalance += amount;
    });

    setTotalTokensReceived(totalReceived);
    // setCurrentTokenBalance(currentBalance);
  };

  const handleReapplyClick = (scheme) => {
    if (!scheme.responses || scheme.responses.length === 0) {
      console.warn("No responses found for this scheme.");
      return;
    }

    setEditingScheme(scheme);
    setUpdatedResponses(
      scheme.responses.reduce((acc, response) => {
        acc[response.key] = response.value || "";
        return acc;
      }, {})
    );
  };

  const handleInputChange = (e, key) => {
    setUpdatedResponses({ ...updatedResponses, [key]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!editingScheme || !editingScheme._id) {
      console.error("Error: Application ID (_id) is missing!");
      return;
    }

    const applicationId = editingScheme._id;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/v1/user/reapply/${applicationId}`,
        { updatedResponses },
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Reapplied successfully!");
      }
    } catch (error) {
      console.error("Failed to resubmit application:", error);
    }
  };

  return (
    <>
      <div className="profile-container">
        <div className="profile-box">
          <div className="profile-initial">{firstLetter}</div>
          <h1 className="profile-name">{user.name}</h1>
          <div className="profile-line" />
          <div className="profile-details">
            <p>
              Aadhar: <span>{user.adhar || "Not Available"}</span>
            </p>
            <p>
              Role: <span>{user.role || "Unknown"}</span>
            </p>
            <p>
              Tokens : {balance !== undefined ? `${balance} GFT` : "Loading..."}
            </p>
            <p>
              <span>Amount in Rs. : </span> {money}
            </p>

            <div className="contarctor-banks">
              <button onClick={handleBankClick}>Convert Tokens to money</button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="applied-schemes-container">
          <h2>{user?.name}'s Applied Schemes</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Scheme Name</th>
                <th>Status</th>
                <th>Fund Disbursed</th>
                <th>Tokens Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appliedSchemes.length > 0 ? (
                appliedSchemes.map((scheme) => (
                  <tr key={scheme._id}>
                    <td>{scheme.schemeName}</td>
                    <td>
                      {scheme.accepted
                        ? "✅ Accepted"
                        : scheme.rejected
                        ? "❌ Rejected"
                        : "⏳ Pending"}
                    </td>
                    <td>{scheme.fundDisbursed ? "Yes" : "No"}</td>
                    <td>{scheme.tokensReceived}</td>
                    <td>
                      {scheme.rejected && (
                        <button onClick={() => handleReapplyClick(scheme)}>
                          Reapply
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No schemes applied yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editingScheme && (
          <div className="resubmission-form">
            <h3>Update Your Application for {editingScheme.schemeName}</h3>
            {editingScheme?.responses?.map((response) => (
              <div key={response.key}>
                <label>{response.label || "Unknown Field"}:</label>
                <input
                  type="text"
                  value={updatedResponses[response.key] || ""}
                  onChange={(e) => handleInputChange(e, response.key)}
                />
              </div>
            ))}
            <button onClick={handleSubmit}>Submit Reapplication</button>
            <button onClick={() => setEditingScheme(null)}>Cancel</button>
          </div>
        )}
      </div>

      {viewBanksModal && (
        <Modal closeModal={closeViewBankModal}>
          {banks && banks.length > 0 && (
            <div className="contractr-banks" onCli>
              {banks.map((bank) => (
                <div
                  onClick={() => {
                    OpenBankModal(bank._id);
                  }}
                  className="contractor-bank-button"
                >
                  {"\u{1F3E6} "}
                  {bank.name}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {isBankModalOpen && (
        <Modal closeModal={closeBankModal}>
          <label htmlFor="account-no">Bank Account No. :</label>
          <input
            type="text"
            name="account-no"
            value={accountNo}
            onChange={HanndleBankInputChange}
            id="account-no"
          />

          <label htmlFor="IFSC-code">IFSC code :</label>
          <input
            type="text"
            name="IFSC-code"
            value={ifsc}
            onChange={HanndleBankInputChange}
            id="IFSC-code"
          />

          <label htmlFor="token-Amount">Token Amount</label>
          <input
            type="number"
            name="token-Amount"
            value={tokenAmount}
            onChange={HanndleBankInputChange}
            id="token-Amount"
          />

          <button className="send-token-btn" onClick={sendTokenToBank}>
            Send Token
          </button>
        </Modal>
      )}

      {isModalOpen && (
        <Modal closeModal={closeModal}>
          <label htmlFor="proof-file">Upload the work done details file</label>
          <input type="file" name="proof-file" onChange={inputChange} />
          <button className="submit-proof-btn" onClick={uploadFile}>
            Submit
          </button>
        </Modal>
      )}
    </>
  );
};

export default UserProfile;
