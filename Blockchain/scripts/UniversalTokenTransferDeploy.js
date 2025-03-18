// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const UniversalTokenTransfer = await ethers.getContractFactory(
    "UniversalTokenTransfer"
  );

  // Replace with the deployed FTK token contract address
  const ftkTokenAddress = "0x055839a8eA4bA24EB9E9cf48BF6E537cbED48e07";

  // Deploy the contract
  console.log("Deploying UniversalTokenTransfer contract...");
  const universalTokenTransfer = await UniversalTokenTransfer.deploy(
    ftkTokenAddress
  );
  await universalTokenTransfer.deployed();

  console.log(
    `UniversalTokenTransfer contract deployed to: ${universalTokenTransfer.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
