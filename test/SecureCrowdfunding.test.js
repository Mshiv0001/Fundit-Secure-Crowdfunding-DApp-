const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecureCrowdfundingDAO Security & Governance Test Suite", function () {
  let factory, token, campaign;
  let owner, creator, backer1, backer2, backer3, attacker;
  const GOAL = ethers.parseEther("5.0");
  const HARD_CAP = ethers.parseEther("10.0");
  const DURATION = 3600; // 1 hour

  beforeEach(async function () {
    [owner, creator, backer1, backer2, backer3, attacker] = await ethers.getSigners();

    // Deploy Factory
    const Factory = await ethers.getContractFactory("CrowdfundingFactory");
    factory = await Factory.deploy();
    await factory.waitForDeployment();

    // Create Campaign via Factory
    const tx = await factory.connect(creator).createCampaign({
      title: "Decentralized AI Compute Grid",
      description: "Crowdfunding open-source decentralized GPU compute cluster",
      category: "Technology",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      goalAmount: GOAL,
      hardCapAmount: HARD_CAP,
      durationSeconds: DURATION,
      tokenName: "AI Compute Token",
      tokenSymbol: "AICOMP"
    });
    const receipt = await tx.wait();

    // Find CampaignCreated event
    const event = receipt.logs.find(
      (log) => factory.interface.parseLog(log)?.name === "CampaignCreated"
    );
    const parsedEvent = factory.interface.parseLog(event);
    const campaignAddress = parsedEvent.args.campaignAddress;
    const tokenAddress = parsedEvent.args.tokenAddress;

    campaign = await ethers.getContractAt("SecureCrowdfundingDAO", campaignAddress);
    token = await ethers.getContractAt("CrowdfundToken", tokenAddress);
  });

  describe("Initialization & Factory Deployment", function () {
    it("should set initial parameters correctly", async function () {
      expect(await campaign.title()).to.equal("Decentralized AI Compute Grid");
      expect(await campaign.creator()).to.equal(creator.address);
      expect(await campaign.goalAmount()).to.equal(GOAL);
      expect(await campaign.hardCapAmount()).to.equal(HARD_CAP);
      expect(await campaign.state()).to.equal(0); // Active
      expect(await campaign.governanceToken()).to.equal(await token.getAddress());
    });
  });

  describe("Multi-Tier Pledging & Governance Token Minting", function () {
    it("should allow Tier 1 (Supporter) contribution with 1.0x token minting", async function () {
      const pledgeAmount = ethers.parseEther("0.05");
      await campaign.connect(backer1).pledge({ value: pledgeAmount });

      const backerInfo = await campaign.backers(backer1.address);
      expect(backerInfo.totalContributed).to.equal(pledgeAmount);
      expect(backerInfo.tier).to.equal(0); // Supporter

      // 0.05 ETH * 1000 = 50 tokens
      const tokenBal = await token.balanceOf(backer1.address);
      expect(tokenBal).to.equal(ethers.parseEther("50"));
    });

    it("should allow Tier 2 (Patron) contribution with 1.25x bonus tokens", async function () {
      const pledgeAmount = ethers.parseEther("0.2");
      await campaign.connect(backer2).pledge({ value: pledgeAmount });

      const backerInfo = await campaign.backers(backer2.address);
      expect(backerInfo.tier).to.equal(1); // Patron

      // 0.2 ETH * 1000 * 1.25 = 250 tokens
      const tokenBal = await token.balanceOf(backer2.address);
      expect(tokenBal).to.equal(ethers.parseEther("250"));
    });

    it("should allow Tier 3 (Guardian) contribution with 1.5x bonus tokens", async function () {
      const pledgeAmount = ethers.parseEther("1.0");
      await campaign.connect(backer3).pledge({ value: pledgeAmount });

      const backerInfo = await campaign.backers(backer3.address);
      expect(backerInfo.tier).to.equal(2); // Guardian

      // 1.0 ETH * 1000 * 1.5 = 1500 tokens
      const tokenBal = await token.balanceOf(backer3.address);
      expect(tokenBal).to.equal(ethers.parseEther("1500"));
    });

    it("should revert if pledge is below minimum 0.01 ETH", async function () {
      await expect(
        campaign.connect(backer1).pledge({ value: ethers.parseEther("0.005") })
      ).to.be.revertedWith("Pledge below minimum tier (0.01 ETH)");
    });
  });

  describe("Quadratic Voting & Milestone Escrow Disbursement", function () {
    beforeEach(async function () {
      // Backers fund the campaign to reach goal (GOAL = 5 ETH)
      await campaign.connect(backer1).pledge({ value: ethers.parseEther("1.0") }); // Guardian
      await campaign.connect(backer2).pledge({ value: ethers.parseEther("2.0") }); // Guardian
      await campaign.connect(backer3).pledge({ value: ethers.parseEther("2.5") }); // Guardian
      expect(await campaign.totalRaised()).to.be.gte(GOAL);
      expect(await campaign.state()).to.equal(1); // GoalReached
    });

    it("should allow creator to propose milestone release", async function () {
      const releaseAmount = ethers.parseEther("1.5");
      const tx = await campaign.connect(creator).proposeMilestone(
        "Milestone 1: Hardware Acquisition",
        "Purchasing 8x NVIDIA H100 GPU nodes",
        "https://github.com/aicompute/receipts/ms1",
        releaseAmount
      );

      const receipt = await tx.wait();
      expect(await campaign.proposalCounter()).to.equal(1);

      const prop = await campaign.proposals(1);
      expect(prop.title).to.equal("Milestone 1: Hardware Acquisition");
      expect(prop.requestedAmount).to.equal(releaseAmount);
      expect(prop.executed).to.equal(false);
    });

    it("should correctly tally quadratic voting weights", async function () {
      await campaign.connect(creator).proposeMilestone(
        "Milestone 1: Hardware Acquisition",
        "Purchasing 8x NVIDIA H100 GPU nodes",
        "https://github.com/aicompute/receipts/ms1",
        ethers.parseEther("1.0")
      );

      // Backer1 votes FOR
      await campaign.connect(backer1).castVote(1, true);
      const propAfterVote1 = await campaign.proposals(1);
      expect(propAfterVote1.forVotesSqrt).to.be.gt(0);
      expect(propAfterVote1.voterCount).to.equal(1);

      // Backer cannot vote twice
      await expect(campaign.connect(backer1).castVote(1, true)).to.be.revertedWith(
        "Already voted on this proposal"
      );
    });

    it("should execute approved milestone after voting deadline and transfer ETH to creator", async function () {
      const releaseAmount = ethers.parseEther("1.0");
      await campaign.connect(creator).proposeMilestone(
        "Milestone 1: Hardware Acquisition",
        "Purchasing 8x NVIDIA H100 GPU nodes",
        "https://github.com/aicompute/receipts/ms1",
        releaseAmount
      );

      // Backers vote FOR
      await campaign.connect(backer1).castVote(1, true);
      await campaign.connect(backer2).castVote(1, true);

      // Fast-forward time past voting deadline (3 days)
      await ethers.provider.send("evm_increaseTime", [3 * 86400 + 10]);
      await ethers.provider.send("evm_mine");

      const creatorBalBefore = await ethers.provider.getBalance(creator.address);
      await campaign.executeMilestone(1);
      const creatorBalAfter = await ethers.provider.getBalance(creator.address);

      expect(creatorBalAfter).to.be.gt(creatorBalBefore);
      const prop = await campaign.proposals(1);
      expect(prop.executed).to.equal(true);
      expect(prop.passed).to.equal(true);
      expect(await campaign.fundsReleased()).to.equal(releaseAmount);
    });
  });

  describe("Pull Refund Pattern on Failed Campaigns", function () {
    let failedCampaign;

    beforeEach(async function () {
      // Create campaign with 10 ETH goal
      const tx = await factory.connect(creator).createCampaign({
        title: "Underfunded Project",
        description: "Test failed goal refund",
        category: "Science",
        imageUrl: "https://example.com/img.jpg",
        goalAmount: ethers.parseEther("10.0"),
        hardCapAmount: ethers.parseEther("20.0"),
        durationSeconds: 300, // 5 minutes
        tokenName: "Refund Token",
        tokenSymbol: "RFT"
      });
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => factory.interface.parseLog(log)?.name === "CampaignCreated"
      );
      const addr = factory.interface.parseLog(event).args.campaignAddress;
      failedCampaign = await ethers.getContractAt("SecureCrowdfundingDAO", addr);

      // Backer contributes 1 ETH (underfunded, target was 10 ETH)
      await failedCampaign.connect(backer1).pledge({ value: ethers.parseEther("1.0") });
    });

    it("should prevent refund before deadline", async function () {
      await expect(failedCampaign.connect(backer1).claimRefund()).to.be.revertedWith(
        "Campaign deadline has not passed"
      );
    });

    it("should allow backer to pull full refund after deadline passes if goal is unmet", async function () {
      // Fast forward past 5 min
      await ethers.provider.send("evm_increaseTime", [310]);
      await ethers.provider.send("evm_mine");

      const balBefore = await ethers.provider.getBalance(backer1.address);
      const tx = await failedCampaign.connect(backer1).claimRefund();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const balAfter = await ethers.provider.getBalance(backer1.address);

      // Balance should be restored minus gas
      expect(balAfter + gasUsed - balBefore).to.equal(ethers.parseEther("1.0"));

      // Second attempt should fail
      await expect(failedCampaign.connect(backer1).claimRefund()).to.be.revertedWith(
        "No contribution to refund"
      );
    });
  });

  describe("Security Controls & Circuit Breaker", function () {
    it("should prevent non-creators/guardians from proposing milestones", async function () {
      await expect(
        campaign.connect(attacker).proposeMilestone("Attack", "Drain", "http://", ethers.parseEther("1.0"))
      ).to.be.revertedWith("Only creator or Guardian backer can propose");
    });

    it("should enforce pause circuit breaker by guardian", async function () {
      await campaign.connect(creator).pause(); // Creator is guardian owner

      await expect(
        campaign.connect(backer1).pledge({ value: ethers.parseEther("0.1") })
      ).to.be.reverted;

      await campaign.connect(creator).unpause();
      await expect(
        campaign.connect(backer1).pledge({ value: ethers.parseEther("0.1") })
      ).to.not.be.reverted;
    });
  });
});
