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

export default connectWallet;
