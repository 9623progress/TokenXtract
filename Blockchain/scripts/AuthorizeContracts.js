const { ethers } = require("hardhat");

async function main() {
  const govTokenAddress = " 0x2dA5777B994D99C90B3bAb99C0B71314e78E0775";
  const contractorFund = "0xcE704f0E7C79061F01A701bDfF1Bce507719f7c3";
  const schemeHolderFund = "0x3f715c8920B434F936dAc6B6cfc9a9ef69B80DA8";

  const GovToken = await ethers.getContractAt("GovToken", govTokenAddress);

  // Authorizing Contracts
  let tx1 = await GovToken.authorizeContract(contractorFund);
  await tx1.wait();

  console.log("ContractorFund authorized");

  let tx2 = await GovToken.authorizeContract(schemeHolderFund);
  await tx2.wait();
  console.log("SchemeHolderFund authorized");

  // Verify
  const isAuthorized1 = await GovToken.authorizedContracts(contractorFund);
  const isAuthorized2 = await GovToken.authorizedContracts(schemeHolderFund);

  console.log("ContractorFund authorized:", isAuthorized1);
  console.log("SchemeHolderFund authorized:", isAuthorized2);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
