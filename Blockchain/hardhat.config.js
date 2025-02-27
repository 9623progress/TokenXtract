require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28", // Ensure this matches your contracts' pragma version

  networks: {
    hardhat: {}, // Default network

    mumbai2: {
      url: process.env.POLYGON_RPC_URL, // Get from .env file
      accounts: [process.env.PRIVATE_KEY], // Use your wallet's private key
    },

    mumbai: {
      url: process.env.POLYGON_RPC_URL_2, // Get from .env file
      accounts: [process.env.PRIVATE_KEY], // Use your wallet's private key
    },
  },

  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
};
