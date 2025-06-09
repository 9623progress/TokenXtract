import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import axios from "axios";
import "../style/ViewApplication.css";
import { toast } from "react-toastify";

// Token contract info
const tokenAddress = "0x9e6DEFb65e5a0c0C6Fa0eAF11CAFd05D31c5e328";
const tokenAbi = [
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

const Accepted = () => {
  const { departments } = useSelector((state) => state.departments);
  const userId = useSelector((state) => state.user.user.id);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState("");
  const [applicants, setApplicants] = useState([]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("🚨 MetaMask is not installed!");
      return null;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      return await provider.getSigner();
    } catch (error) {
      console.error("Wallet connection failed:", error);
      toast.error("❌ Failed to connect to MetaMask.");
      return null;
    }
  };

  const handleDepartmentChange = async (e) => {
    const deptId = e.target.value;
    setSelectedDepartment(deptId);
    setSelectedScheme("");
    setApplicants([]);

    if (deptId) {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/v1/admin/get-scheme/${deptId}`,
          { withCredentials: true }
        );
        setSchemes(res.data.schemes || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to fetch schemes.");
      }
    }
  };

  const handleSchemeChange = async (e) => {
    const schemeId = e.target.value;
    setSelectedScheme(schemeId);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/v1/admin/accepted-form/${schemeId}`,
        { withCredentials: true }
      );
      setApplicants(res.data.applicants || []);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to fetch applicants."
      );
    }
  };

  const handleView = (url) => {
    const newTab = window.open(url, "_blank");
    newTab?.focus();
  };

  const handleDisburstFund = async () => {
    if (!selectedScheme) return toast.warn("Select a scheme first!");

    try {
      const res = await axios.get(
        `http://localhost:5000/api/v1/admin/getAcceptedApplicantsWallet/${selectedScheme}`
      );

      const applicantsWallets = res.data.data || [];
      if (!applicantsWallets.length) {
        toast.error("❌ No valid applicant wallets found.");
        return;
      }

      const signer = await connectWallet();
      if (!signer) return;
      console.log(applicantsWallets);
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);

      for (let applicant of applicantsWallets) {
        const { walletAddress, amountPerUser, _id } = applicant;

        if (!ethers.isAddress(walletAddress)) {
          toast.error(`❌ Invalid wallet: ${walletAddress}`);
          continue;
        }

        const amount = ethers.parseUnits(amountPerUser.toString(), 18);

        try {
          const tx = await tokenContract.transfer(walletAddress, amount);
          console.log(`TX Hash: ${tx.hash}`);
          // ✅ Only update backend after successful transfer
          const receipt = await tx.wait(); // Wait for confirmation
          console.log(receipt);
          if (receipt.status === 1) {
            toast.success(`✅ Tokens sent to ${walletAddress}`);

            // ✅ Update backend only if transaction succeeded
            await axios.post(
              "http://localhost:5000/api/v1/admin/fund-transfer",
              {
                schemeID: selectedScheme,
                adminId: userId,
                applicantId: _id,
              },
              { withCredentials: true }
            );
          } else {
            toast.error(`⚠️ Transaction failed on-chain for ${walletAddress}`);
          }
        } catch (txErr) {
          console.error(txErr);
        }
      }

      setApplicants([]);
      toast.success("🎉 Fund disbursement completed.");
    } catch (err) {
      console.error(err);
      toast.error("🚨 Fund disbursement failed.");
    }
  };

  const renderTable = () => {
    if (!applicants.length) {
      return <p>No applicants found for the selected scheme.</p>;
    }

    const sortedApplicants = applicants.map((app) => ({
      ...app,
      responses: [...app.responses].sort((a, b) =>
        a.key._id.localeCompare(b.key._id)
      ),
    }));

    const headers = sortedApplicants[0]?.responses.map((res) => res.key.label);

    return (
      <div>
        <table border="1">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedApplicants.map((applicant) => (
              <tr key={applicant._id}>
                {applicant.responses.map((res) => (
                  <td key={res.key._id}>
                    {res.key.type === "image" ? (
                      <button
                        className="view-application-button"
                        onClick={() => handleView(res.value)}
                      >
                        View
                      </button>
                    ) : (
                      res.value
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={handleDisburstFund}>Disburst Fund</button>
      </div>
    );
  };

  return (
    <div className="view-application-top-div">
      <div className="view-application-select-div">
        <select value={selectedDepartment} onChange={handleDepartmentChange}>
          <option value="">Select Department</option>
          {departments.map((dep) => (
            <option key={dep._id} value={dep._id}>
              {dep.departmentName}
            </option>
          ))}
        </select>

        <select value={selectedScheme} onChange={handleSchemeChange}>
          <option value="">Select Scheme</option>
          {schemes.map((sc) => (
            <option key={sc._id} value={sc._id}>
              {sc.schemeName}
            </option>
          ))}
        </select>
      </div>

      <div className="view-application-table">{renderTable()}</div>
    </div>
  );
};

export default Accepted;
