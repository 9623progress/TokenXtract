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
const GOVTOKEN_ADDRESS = "0x43Dd8A1a3fB1788bfC9303e68626DBd06b06790C"; //--temporary
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
      const govToken = new ethers.Contract(
        GOVTOKEN_ADDRESS,
        GovTokenABI.abi,
        signer
      );

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
