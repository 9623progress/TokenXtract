const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying MyToken with the account:", deployer.address);

  // const GVTTokenAddress = "0x87830c160Fb02f13174Bc2DBAF8A989F1584Bd8F"; // Replace with the actual GVT token address
  const mytoken = await hre.ethers.getContractFactory("MyToken");
  const ContractDeploy = await mytoken.deploy();

  await ContractDeploy.deployed();

  console.log("SimpleGVTTransfer deployed to:", await ContractDeploy.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
