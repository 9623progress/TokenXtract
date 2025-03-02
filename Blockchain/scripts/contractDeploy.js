const hre = require("hardhat");

async function main() {
  const govTokenAddress = "0x87830c160Fb02f13174Bc2DBAF8A989F1584Bd8F";

  const ContractorFund = await hre.ethers.getContractFactory("ContractorFund");
  const contractorFund = await ContractorFund.deploy(govTokenAddress);

  await contractorFund.deployed();
  console.log(`ContractorFund deployed at: ${contractorFund.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
