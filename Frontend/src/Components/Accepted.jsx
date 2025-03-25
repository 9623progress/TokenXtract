import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import {ethers} from 'ethers'
import axios from "axios";
import "../style/ViewApplication.css";
import { toast } from "react-toastify";

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

const Accepted = () => {
  const { departments } = useSelector((state) => state.departments);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [scheme, setScheme] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState("");
  const [applicants, setApplicants] = useState([]);

  const id = useSelector((state) => state.user.user.id);

  const fetch = useCallback(async (department_id) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin/get-scheme/${department_id}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        setScheme(response.data.schemes);
      }
    } catch (error) {
      console.error("Error fetching schemes:", error);
      toast.error(error.response.data.message);
    }
  }, []);

  const HandleDepartmentChange = async (e) => {
    const department_id = e.target.value;
    if (department_id) {
      setSelectedDepartment(department_id);
      fetch(department_id);
    }
  };

  const HandleSchemeChange = (e) => {
    const scheme_id = e.target.value;
    setSelectedScheme(scheme_id);
    fetchApplications(scheme_id);
  };

  const HandleView = (data) => {
    const newTab = window.open(data, "_blank");
    newTab.focus();
  };

  // const handleDisburstFund = async () => {
  //   try {
  //     const response = await axios.post(
  //       "http://localhost:5000/api/v1/admin/fund-transfer",
  //       {
  //         schemeId: selectedScheme,
  //         adminId: id,
  //       },
  //       {
  //         withCredentials: true,
  //       }
  //     );

  //     console.log(response);

  //     if (response.status == 200) {
  //       toast.success(response.data.success);
  //       setApplicants([]);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error.response.data.message);
  //   }
  // };


  const handleDisburstFund = async () => {
    try {
      // 1️⃣ Fetch applicants' wallet addresses
      console.log(selectedScheme);
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin/getAcceptedApplicantsWallet/${selectedScheme}`
      );
      
      console.log(response);
      if (response.status !== 200 || response.data.length===0) {
        toast.error("❌ No applicants found or wallet addresses missing!");
        return;
      }
  
      const applicantsWallets = response.data.data; // Array of { walletAddress, amount }
      // const amt=response.data.amountPerUser;

      console.log(applicantsWallets);
      
      // 2️⃣ Connect to MetaMask
      if (!window.ethereum) {
        toast.error("🚨 MetaMask is not installed!");
        return;
      }
  
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
  
       const signer=await connectWallet();
      // 3️⃣ Load the Token Contract
      const tokenContract = new ethers.Contract(shivaniAddress, shivaniAbi, signer);
  
      // 4️⃣ Transfer tokens to each applicant
      for (let applicant of applicantsWallets) {
        const { walletAddress, amountPerUser } = applicant;
        
        if (!ethers.isAddress(walletAddress)) {
          toast.error(`❌ Invalid wallet address: ${walletAddress}`);
          continue;
        }
  
        const amountToSend = ethers.parseUnits((amountPerUser || "0").toString(), 18);

  
        try {
          const tx = await tokenContract.transfer(walletAddress, amountToSend);
          console.log(`⏳ Transaction Sent to ${walletAddress} - TX Hash:`, tx.hash);
          await tx.wait();
          console.log(`✅ Tokens Transferred to ${walletAddress}`);
        } catch (txError) {
          console.error(`❌ Failed for ${walletAddress}:`, txError);
          toast.error(`❌ Transaction failed for ${walletAddress}`);
        }
      }
  
      // 5️⃣ Update the backend after successful disbursement
      await axios.post(
        "http://localhost:5000/api/v1/admin/fund-transfer",
        { schemeID: selectedScheme, adminId: id },
        { withCredentials: true }
      );
  
      toast.success("🎉 Fund disbursed successfully!");
      setApplicants([]); // Clear the table after successful disbursement
  
    } catch (error) {
        console.error("❌ Error during fund disbursement:", error);
        if (error.response) {
          console.log("Error Response Data:", error.response.data);
          console.log("Error Status:", error.response.status);
          console.log("Error Headers:", error.response.headers);
        }
        toast.error("🚨 Unexpected error occurred. Please try again.");
      toast.error("🚨 Unexpected error occurred. Please try again.");
    }
  };

  
  const fetchApplications = useCallback(async (schemeID) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin/accepted-form/${schemeID}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setApplicants(response.data.applicants);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error(error.response.data.message);
    }
  }, []);

  //   const handleAccept = async (applicantId) => {
  //     try {
  //       const response = await axios.patch(
  //         http://localhost:5000/api/v1/admin/accept-form/${applicantId}
  //       );
  //       if (response.status == 200) {
  //         toast.success(response.data.message || "Form accepted");
  //       }
  //     } catch (error) {
  //       console.log(error);
  //       toast.error(error.data.message || "something went wrong");
  //     }
  //   };
  //   const handleReject = async (applicantId) => {
  //     try {
  //       const response = await axios.patch(
  //         http://localhost:5000/api/v1/admin/reject-form/${applicantId}
  //       );
  //       if (response.status == 200) {
  //         toast.success(response.data.message || "Form rejected");
  //       }
  //     } catch (error) {
  //       console.log(error);
  //       toast.error(error.data.message || "something went wrong");
  //     }
  //   };

  const renderTable = () => {
    if (applicants.length === 0) {
      return <p>No applicants found for the selected scheme.</p>;
    }

    // Sorting responses based on key._id
    const sortedApplicants = applicants.map((applicant) => {
      const sortedResponses = [...applicant.responses].sort((a, b) => {
        return a.key._id.localeCompare(b.key._id); // Ascending order
      });
      return { ...applicant, responses: sortedResponses };
    });

    // Extracting headers dynamically from the sorted responses
    const headers = sortedApplicants[0]?.responses.map(
      (response) => response.key.label
    );

    return (
      <div>
        <table border="1">
          <thead>
            <tr>
              {headers &&
                headers.map((header) => <th key={header}>{header}</th>)}
              {/* <th>Actions</th> */}
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
                        onClick={() => HandleView(res.value)}
                      >
                        View
                      </button>
                    ) : (
                      res.value
                    )}
                  </td>
                ))}
                {/* <td>
                <button
                  className=" accept"
                  onClick={() => handleAccept(applicant._id)}
                  style={{ backgroundColor: "green" }}
                >
                  Accept
                </button>
                <button
                  className="reject"
                  onClick={() => handleReject(applicant._id)}
                  style={{ marginLeft: "10px", backgroundColor: "red" }}
                >
                  Reject
                </button>
              </td> */}
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
        <select value={selectedDepartment} onChange={HandleDepartmentChange}>
          <option value="">Select Department</option>
          {departments &&
            departments.map((dep) => (
              <option key={dep._id} value={dep._id}>
                {dep.departmentName}
              </option>
            ))}
        </select>

        <select value={selectedScheme} onChange={HandleSchemeChange}>
          <option value="">Select Scheme</option>
          {scheme &&
            scheme.map((sc) => (
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

