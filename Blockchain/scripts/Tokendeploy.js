const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with the account:", deployer.address);

  // Set initial supply (in tokens)
  const initialSupply = ethers.utils.parseUnits("1000000", 18);

  const FundToken = await ethers.getContractFactory("FundToken");
  const fundToken = await FundToken.deploy(initialSupply);

  await fundToken.deployed();

  console.log("FundToken deployed at:", fundToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
