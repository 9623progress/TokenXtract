import { ethers } from "ethers";
import { contractAddress, contractABI } from "./constants";

export const connectWallet = async () => {
    if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        return { signer, contract };
    } else {
        alert("Please install MetaMask!");
        return null;
    }
};

// ✅ Mint Tokens Function
export const mintTokens = async (contract, amount) => {
    if (!contract) return alert("Connect Wallet First!");
    const tx = await contract.mintTokens(amount);
    await tx.wait();
    alert(`${amount} Tokens Minted!`);
};

// ✅ Get Total Supply
export const fetchTotalSupply = async (contract) => {
    if (!contract) return alert("Connect Wallet First!");
    const supply = await contract.getTotalSupply();
    return ethers.utils.formatUnits(supply, 18);
};
