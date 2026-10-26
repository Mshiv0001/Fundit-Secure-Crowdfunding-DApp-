const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment of Secure Crowdfunding DAO ecosystem...");

  const [deployer, creator, backer1, backer2] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // 1. Deploy Factory
  const CrowdfundingFactory = await hre.ethers.getContractFactory("CrowdfundingFactory");
  const factory = await CrowdfundingFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("CrowdfundingFactory deployed to:", factoryAddress);

  // 2. Deploy sample campaigns with rich initial states
  const now = Math.floor(Date.now() / 1000);
  
  // Campaign 1: Decentralized AI Compute Grid (Active, funded partially)
  const tx1 = await factory.connect(creator).createCampaign({
    title: "NeuroMesh: Decentralized AI Compute Grid",
    description: "Building peer-to-peer distributed GPU training cluster with verifiable zero-knowledge proof of compute. High-performance, anti-censorship machine intelligence.",
    category: "AI & Infrastructure",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    goalAmount: hre.ethers.parseEther("8.0"),
    hardCapAmount: hre.ethers.parseEther("15.0"),
    durationSeconds: 14 * 86400, // 14 days
    tokenName: "NeuroMesh Governance",
    tokenSymbol: "NMESH"
  });
  const r1 = await tx1.wait();
  const event1 = r1.logs.find(log => factory.interface.parseLog(log)?.name === "CampaignCreated");
  const c1Addr = factory.interface.parseLog(event1).args.campaignAddress;
  const t1Addr = factory.interface.parseLog(event1).args.tokenAddress;

  // Add initial pledges to Campaign 1
  const c1 = await hre.ethers.getContractAt("SecureCrowdfundingDAO", c1Addr);
  if (backer1) {
    await c1.connect(backer1).pledge({ value: hre.ethers.parseEther("2.5") });
  }
  if (backer2) {
    await c1.connect(backer2).pledge({ value: hre.ethers.parseEther("1.0") });
  }

  // Campaign 2: Zero-Knowledge Privacy Mobile OS (Goal reached, active milestone voting!)
  const tx2 = await factory.connect(creator).createCampaign({
    title: "CipherOS: Hardware-Enforced Zero-Knowledge Mobile",
    description: "An open-source RISC-V mobile phone OS providing hardware-level cryptographic isolation, automated wallet security, and decentralized identity by default.",
    category: "Privacy & Hardware",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    goalAmount: hre.ethers.parseEther("3.0"),
    hardCapAmount: hre.ethers.parseEther("6.0"),
    durationSeconds: 21 * 86400,
    tokenName: "CipherOS DAO",
    tokenSymbol: "CIPHER"
  });
  const r2 = await tx2.wait();
  const event2 = r2.logs.find(log => factory.interface.parseLog(log)?.name === "CampaignCreated");
  const c2Addr = factory.interface.parseLog(event2).args.campaignAddress;
  const c2 = await hre.ethers.getContractAt("SecureCrowdfundingDAO", c2Addr);
  
  if (backer1) {
    await c2.connect(backer1).pledge({ value: hre.ethers.parseEther("2.0") });
  }
  if (backer2) {
    await c2.connect(backer2).pledge({ value: hre.ethers.parseEther("1.5") });
  }

  // Create Milestone on Campaign 2 (since goal is reached)
  await c2.connect(creator).proposeMilestone(
    "Milestone 1: Kernel Hardening & ZK Proof Verification",
    "Completed memory-safe microkernel integration and audited cryptographic primitives. Formal verification report attached on IPFS.",
    "https://github.com/cipher-os/audits/milestone-1.pdf",
    hre.ethers.parseEther("1.2")
  );

  // Cast initial quadratic vote
  if (backer1) {
    await c2.connect(backer1).castVote(1, true);
  }

  // 3. Export ABIs and addresses to frontend src/contracts
  const exportDir = path.join(__dirname, "../src/contracts");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const factoryArtifact = await hre.artifacts.readArtifact("CrowdfundingFactory");
  const campaignArtifact = await hre.artifacts.readArtifact("SecureCrowdfundingDAO");
  const tokenArtifact = await hre.artifacts.readArtifact("CrowdfundToken");

  const deployedData = {
    factoryAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 1337,
    sampleCampaigns: [
      { address: c1Addr, token: t1Addr, title: "NeuroMesh: Decentralized AI Compute Grid" },
      { address: c2Addr, title: "CipherOS: Hardware-Enforced Zero-Knowledge Mobile" }
    ],
    CrowdfundingFactoryAbi: factoryArtifact.abi,
    SecureCrowdfundingDAOAbi: campaignArtifact.abi,
    CrowdfundTokenAbi: tokenArtifact.abi
  };

  fs.writeFileSync(
    path.join(exportDir, "deployedContracts.json"),
    JSON.stringify(deployedData, null, 2)
  );

  console.log("Exported contract ABIs and addresses to src/contracts/deployedContracts.json");
  console.log("Deployment completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
