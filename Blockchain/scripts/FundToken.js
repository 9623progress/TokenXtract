const hre = require("hardhat");

async function main() {
  const GovFundToken = await hre.ethers.getContractFactory("GovFundToken");
  const token = await GovFundToken.deploy();
  await token.deployed();

  console.log("GovFundToken deployed to:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// await token.mintTokens(20); 
// console.log("Tokens created successfully!");