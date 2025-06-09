// Token contract details
import { ethers } from "ethers";
import axios from "axios";

export const tokenAddress = "0x9e6DEFb65e5a0c0C6Fa0eAF11CAFd05D31c5e328"; // ERC-20 token address
export const tokenABI = [
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

export const fetchTokenBalance = async (UserAddress) => {
  try {
    if (!window.ethereum || !UserAddress) return;
    console.log("if statisfied");
    console.log(UserAddress);
    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log(1);
    const contract = new ethers.Contract(tokenAddress, tokenABI, provider);
    console.log(contract);
    const rawBalance = await contract.balanceOf(UserAddress);
    console.log(rawBalance);
    const decimals = 18; // 👈 Use 18 if not present in ABI
    const formattedBalance = await ethers.formatUnits(rawBalance, decimals);
    console.log(formattedBalance);
    return formattedBalance;
  } catch (error) {
    console.error("❌ Failed to fetch token balance:", error);
    return "";
  }
};

export const updateMoneyInBackend = async (id, amount) => {
  try {
    const response = await axios.post(
      `http://localhost:5000/api/v1/user/updateMoney/${id}`,
      { amount: Number(amount) }
    );

    if (
      response.status === 200 &&
      response.data?.message === "Amount updated"
    ) {
      toast.success("💰 Backend updated successfully!");
    }
  } catch (backendError) {
    console.error("Backend Error:", backendError);
  }
};

export const getMoney = async (id) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/v1/user/getMoney/${id}`
    );
    console.log(response);
    return response?.data?.data;
  } catch (error) {
    console.log(error);
  }
};
