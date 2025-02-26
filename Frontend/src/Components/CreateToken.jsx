// import React, { useState } from "react";
// import "../style/createToken.css";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// const CreateToken = () => {
//   const [token, setToken] = useState(0);
//   const id = useSelector((state) => state.user.user.id);
//   const Actualtoken = useSelector((state) => state.user.user.Token);
//   const handleTokenChange = (e) => {
//     setToken(e.target.value);
//   };

//   const HandleCreateToken = async () => {
//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/v1/admin/create-token",
//         {
//           TokenAmount: token,
//           userId: id,
//         },
//         {
//           withCredentials: true,
//         }
//       );

//       console.log(response);

//       if (response.status == 200) {
//         setToken(0);
//         toast.success(response.data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.response.data.message);
//     }
//   };

//   return (
//     <div className="create-token-top-div">
//       <div className="create-token-box">
//         <div className="create-token-input">
//           <label htmlFor="create-token">Enter Token Amount : </label>
//           <input
//             id="create-token"
//             type="number"
//             placeholder="Token"
//             value={token}
//             onChange={handleTokenChange}
//           />
//         </div>
//         <button className="create-token-button" onClick={HandleCreateToken}>
//           Create Tokens
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CreateToken;

import { ethers } from "ethers";
import React, { useState } from "react";
import "../style/createToken.css";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const contractAddress = "0x055839a8eA4bA24EB9E9cf48BF6E537cbED48e07";

const contractABI = [
  {
    inputs: [
      { internalType: "uint256", name: "initialSupply", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "getTokenPriceInRs",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amountInRs", type: "uint256" },
    ],
    name: "mintTokensByAmountInRs",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "newPrice", type: "uint256" }],
    name: "setTokenPriceInRs",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const CreateToken = () => {
  const [token, setToken] = useState("");
  const id = useSelector((state) => state.user.user?.id);

  const handleTokenChange = (e) => {
    setToken(e.target.value);
  };

  const HandleCreateToken = async () => {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask!");
        return;
      }

      if (!token || isNaN(token) || Number(token) <= 0) {
        toast.error("Enter a valid token amount!");
        return;
      }

      // Request MetaMask connection
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Initialize ethers provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Connect to the contract
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Call the contract function to mint tokens
      const tx = await contract.mintTokensByAmountInRs(
        userAddress,
        ethers.parseUnits(token, 0)
      );
      await tx.wait();

      toast.success("Tokens minted successfully!");
      setToken("");
    } catch (error) {
      console.error("Minting error:", error);
      toast.error(error.reason || "Transaction failed!");
    }
  };

  return (
    <div className="create-token-top-div">
      <div className="create-token-box">
        <div className="create-token-input">
          <label htmlFor="create-token">Enter Token Amount (in Rs): </label>
          <input
            id="create-token"
            type="number"
            placeholder="Enter Amount in Rs"
            value={token}
            onChange={handleTokenChange}
            min="1"
          />
        </div>
        <button className="create-token-button" onClick={HandleCreateToken}>
          Create Tokens
        </button>
      </div>
    </div>
  );
};

export default CreateToken;
