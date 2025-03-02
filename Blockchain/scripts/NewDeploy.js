const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1️⃣ Deploy GovToken First
  const GovToken = await hre.ethers.getContractFactory("GovToken");
  const govToken = await GovToken.deploy();
  await govToken.deployed();
  console.log("✅ GovToken deployed at:", govToken.address);

  // 2️⃣ Deploy SchemeHolderFund with GovToken's address
  const SchemeHolderFund = await hre.ethers.getContractFactory(
    "SchemeHolderFund"
  );
  const schemeHolderFund = await SchemeHolderFund.deploy(govToken.address);
  await schemeHolderFund.deployed();
  console.log("✅ SchemeHolderFund deployed at:", schemeHolderFund.address);

  // 3️⃣ Deploy Contractor (if it needs GovToken or SchemeHolderFund address)
  const Contractor = await hre.ethers.getContractFactory("ContractorFund");
  const contractor = await Contractor.deploy(govToken.address); // Modify if needed
  await contractor.deployed();
  console.log("✅ Contractor deployed at:", contractor.address);
}

// Execute Deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
