import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../style/ContractorProfile.css";
import Modal from "./Modal";
import { toast } from "react-toastify";
import { ethers } from "ethers";

const ContractorProfile = () => {
  const user = useSelector((state) => state.user?.user);
  const [contractData, setContractData] = useState([]);
  const [selectedStages, setSelectedStages] = useState(null);
  const [budget, setBudget] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contractId, setContractId] = useState("");
  const [stageId, setStageId] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [banks, setBanks] = useState([]);
  const [viewBank, setViewBank] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIFsc] = useState("");
  const [tokenAmount, setTokenAmount] = useState(0);
  const [bank_id, setBank_id] = useState("");

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

  const inputChange = (e) => {
    if (e.target.files.length > 0) {
      setProofFile(e.target.files[0]);
    }
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

  const closeBankModal = () => {
    setIsBankModalOpen(false);
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

  const OpenBankModal = (bank_id) => {
    setIsBankModalOpen(true);
    setBank_id(bank_id);
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

  const handleBankClick = () => {
    getBanks();
    setBanks(true);
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
      const contract = new ethers.Contract(shivaniAddress, shivaniAbi, signer);
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

      <div className="contarctor-banks">
        <button onClick={handleBankClick}>view Banks</button>
      </div>

      {banks && banks.length > 0 && (
        <div className="contractr-banks" onCli>
          {banks.map((bank) => (
            <div
              onClick={() => {
                OpenBankModal(bank._id);
              }}
              className="contractor-bank-button"
            >
              {bank.name}
            </div>
          ))}
        </div>
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

          <button onClick={sendTokenToBank}>send Token</button>
        </Modal>
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
