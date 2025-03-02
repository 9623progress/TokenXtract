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
import GovTokenABI from "../../../Blockchain/artifacts/Contracts/NewToken.sol/GovToken.json"; // Import ABI

// const GOVTOKEN_ADDRESS = "0x87830c160Fb02f13174Bc2DBAF8A989F1584Bd8F"; // GovToken contract address
const GOVTOKEN_ADDRESS = "0x9e6DEFb65e5a0c0C6Fa0eAF11CAFd05D31c5e328"; //--temporary
const abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "CONVERSION_RATE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountInRs",
        type: "uint256",
      },
    ],
    name: "mintTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
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
      if (!token || isNaN(token) || Number(token) <= 0) {
        toast.error("Enter a valid token amount!");
        return;
      }

      // Request MetaMask connection
      if (!window.ethereum) {
        toast.error("Please install MetaMask!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(); // Get the connected wallet
      console.log(signer);
      // Connect to GovToken contract
      const govToken = new ethers.Contract(GOVTOKEN_ADDRESS, abi, signer);

      // Convert token amount to appropriate units (assuming 18 decimals)
      const amountToMint = ethers.parseUnits(token, 18);

      // Call the mint function
      const tx = await govToken.mint(signer.address, amountToMint);
      await tx.wait();

      toast.success(`Successfully minted ${token} tokens!`);
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
