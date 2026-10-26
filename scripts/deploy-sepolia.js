const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  if (hre.network.name !== "sepolia") {
    throw new Error("This script must be run with --network sepolia.");
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying CrowdfundingFactory from:", deployer.address);

  const Factory = await hre.ethers.getContractFactory("CrowdfundingFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("CrowdfundingFactory deployed to:", factoryAddress);

  const factoryArtifact = await hre.artifacts.readArtifact("CrowdfundingFactory");
  const campaignArtifact = await hre.artifacts.readArtifact("SecureCrowdfundingDAO");
  const tokenArtifact = await hre.artifacts.readArtifact("CrowdfundToken");
  const deployedData = {
    factoryAddress,
    network: hre.network.name,
    chainId: 11155111,
    sampleCampaigns: [],
    CrowdfundingFactoryAbi: factoryArtifact.abi,
    SecureCrowdfundingDAOAbi: campaignArtifact.abi,
    CrowdfundTokenAbi: tokenArtifact.abi
  };

  fs.writeFileSync(
    path.join(__dirname, "../src/contracts/deployedContracts.json"),
    JSON.stringify(deployedData, null, 2)
  );
  console.log("Updated src/contracts/deployedContracts.json for Sepolia.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
