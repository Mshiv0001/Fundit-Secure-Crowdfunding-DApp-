require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL || "";
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: { chainId: 1337 },
    localhost: { url: "http://127.0.0.1:8545", chainId: 1337 },
    sepolia: {
      url: sepoliaRpcUrl,
      chainId: 11155111,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
