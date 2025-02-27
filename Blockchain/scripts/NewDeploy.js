const hre = require("hardhat");

async function main() {
  const GovToken = await hre.ethers.getContractFactory("GovToken");
  const govToken = await GovToken.deploy();
  await govToken.deployed();
  console.log(`GovToken deployed at: ${govToken.address}`);

  const ContractorFund = await hre.ethers.getContractFactory("ContractorFund");
  const contractorFund = await ContractorFund.deploy(govToken.address);
  await contractorFund.deployed();
  console.log(`ContractorFund deployed at: ${contractorFund.address}`);

  const SchemeHolderFund = await hre.ethers.getContractFactory(
    "SchemeHolderFund"
  );
  const schemeHolderFund = await SchemeHolderFund.deploy(govToken.address);
  await schemeHolderFund.deployed();
  console.log(`SchemeHolderFund deployed at: ${schemeHolderFund.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
