// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./CrowdfundToken.sol";

/**
 * @title SecureCrowdfundingDAO
 * @notice Enterprise-grade secure crowdfunding contract featuring:
 *         - Multi-tier pledge options (Supporter, Patron, Guardian)
 *         - Backer governance token distribution
 *         - Quadratic voting on milestone payouts to prevent rug pulls
 *         - Checks-Effects-Interactions & ReentrancyGuard protection
 *         - Trustless pull-based refunds if soft-cap goal is missed
 *         - Circuit breaker emergency pause
 */
contract SecureCrowdfundingDAO is ReentrancyGuard, Pausable, Ownable {
    using Math for uint256;

    enum CampaignState { Active, GoalReached, Failed, Cancelled }
    enum Tier { Supporter, Patron, Guardian }

    struct MilestoneProposal {
        uint256 id;
        string title;
        string description;
        string proofUrl;
        uint256 requestedAmount;
        uint256 votingDeadline;
        uint256 forVotesSqrt;
        uint256 againstVotesSqrt;
        uint256 voterCount;
        bool executed;
        bool passed;
    }

    struct BackerInfo {
        uint256 totalContributed;
        Tier tier;
        bool refunded;
        uint256 tokenAllocation;
    }

    // Campaign Metadata
    string public title;
    string public description;
    string public category;
    string public imageUrl;
    address payable public immutable creator;
    uint256 public immutable goalAmount;      // Soft-cap target in wei
    uint256 public immutable hardCapAmount;  // Maximum allowed total
    uint256 public immutable deadline;       // Campaign end timestamp
    uint256 public totalRaised;
    uint256 public fundsReleased;
    uint256 public backerCount;
    CampaignState public state;

    CrowdfundToken public governanceToken;

    // Minimum tier thresholds in wei
    uint256 public constant TIER_SUPPORTER_MIN = 0.01 ether;
    uint256 public constant TIER_PATRON_MIN = 0.1 ether;
    uint256 public constant TIER_GUARDIAN_MIN = 0.5 ether;

    // Minimum voting duration: 1 day in production (can be configured or default 1 day)
    uint256 public votingDuration = 3 days;

    // Backer mapping
    mapping(address => BackerInfo) public backers;
    address[] public backerAddresses;

    // Milestone Proposals
    uint256 public proposalCounter;
    mapping(uint256 => MilestoneProposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVotedOnProposal;

    // Events
    event Pledged(address indexed backer, uint256 amount, Tier tier, uint256 tokensMinted);
    event RefundClaimed(address indexed backer, uint256 amount);
    event MilestoneProposed(uint256 indexed proposalId, string title, uint256 requestedAmount, uint256 deadline);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 quadraticWeight);
    event MilestoneExecuted(uint256 indexed proposalId, uint256 amountReleased, address recipient);
    event CampaignStateChanged(CampaignState newState);
    event EmergencyFundsRecovered(address indexed recipient, uint256 amount);

    modifier onlyCreator() {
        require(msg.sender == creator, "Only campaign creator can call this");
        _;
    }

    modifier onlyBacker() {
        require(backers[msg.sender].totalContributed > 0, "Only backers can call this");
        _;
    }

    struct CampaignInitParams {
        string title;
        string description;
        string category;
        string imageUrl;
        address payable creator;
        uint256 goalAmount;
        uint256 hardCapAmount;
        uint256 durationSeconds;
        address tokenAddress;
        address guardianOwner;
    }

    constructor(CampaignInitParams memory params) Ownable(params.guardianOwner) {
        require(params.creator != address(0), "Invalid creator address");
        require(params.goalAmount > 0, "Goal must be greater than zero");
        require(params.hardCapAmount >= params.goalAmount, "Hard cap must be >= goal");
        require(params.durationSeconds >= 60, "Duration must be at least 1 minute");

        title = params.title;
        description = params.description;
        category = params.category;
        imageUrl = params.imageUrl;
        creator = params.creator;
        goalAmount = params.goalAmount;
        hardCapAmount = params.hardCapAmount;
        deadline = block.timestamp + params.durationSeconds;
        state = CampaignState.Active;

        if (params.tokenAddress != address(0)) {
            governanceToken = CrowdfundToken(params.tokenAddress);
        }
    }

    function setGovernanceToken(address _tokenAddress) external onlyOwner {
        require(address(governanceToken) == address(0), "Token already set");
        require(_tokenAddress != address(0), "Invalid token");
        governanceToken = CrowdfundToken(_tokenAddress);
    }

    function setVotingDuration(uint256 _duration) external onlyCreator {
        require(_duration >= 1 hours, "Voting duration must be >= 1 hour");
        votingDuration = _duration;
    }

    /**
     * @notice Pledge funds to the crowdfunding campaign.
     *         Mints DAO governance tokens based on tier multiplier:
     *         - Supporter (0.01 - <0.1 ETH): 1x tokens
     *         - Patron (0.1 - <0.5 ETH): 1.25x tokens
     *         - Guardian (>= 0.5 ETH): 1.5x tokens
     */
    function pledge() external payable whenNotPaused nonReentrant {
        require(block.timestamp < deadline, "Campaign has ended");
        require(state == CampaignState.Active, "Campaign is not active");
        require(msg.value >= TIER_SUPPORTER_MIN, "Pledge below minimum tier (0.01 ETH)");
        require(totalRaised + msg.value <= hardCapAmount, "Exceeds hard cap");

        BackerInfo storage backer = backers[msg.sender];
        if (backer.totalContributed == 0) {
            backerCount++;
            backerAddresses.push(msg.sender);
        }

        backer.totalContributed += msg.value;
        totalRaised += msg.value;

        // Determine tier
        Tier assignedTier = Tier.Supporter;
        uint256 bonusMultiplierBps = 10000; // 1.0x (100%)

        if (backer.totalContributed >= TIER_GUARDIAN_MIN) {
            assignedTier = Tier.Guardian;
            bonusMultiplierBps = 15000; // 1.5x (150%)
        } else if (backer.totalContributed >= TIER_PATRON_MIN) {
            assignedTier = Tier.Patron;
            bonusMultiplierBps = 12500; // 1.25x (125%)
        }
        backer.tier = assignedTier;

        // 1 ETH = 1000 base tokens (scaled by 1e18)
        uint256 tokensToMint = (msg.value * 1000 * bonusMultiplierBps) / 10000;
        backer.tokenAllocation += tokensToMint;

        if (address(governanceToken) != address(0)) {
            governanceToken.mint(msg.sender, tokensToMint);
        }

        emit Pledged(msg.sender, msg.value, assignedTier, tokensToMint);

        // Check if goal reached
        if (totalRaised >= goalAmount && state == CampaignState.Active) {
            state = CampaignState.GoalReached;
            emit CampaignStateChanged(CampaignState.GoalReached);
        }
    }

    /**
     * @notice Claim a 100% refund if the campaign failed to reach its soft-cap goal before deadline.
     *         Strict Checks-Effects-Interactions pattern protects against reentrancy.
     */
    function claimRefund() external nonReentrant {
        require(block.timestamp >= deadline, "Campaign deadline has not passed");
        require(totalRaised < goalAmount, "Campaign succeeded; funds are in escrow");
        
        BackerInfo storage backer = backers[msg.sender];
        uint256 contribution = backer.totalContributed;
        require(contribution > 0, "No contribution to refund");
        require(!backer.refunded, "Refund already processed");

        // Checks & Effects
        backer.refunded = true;
        backer.totalContributed = 0;

        if (state != CampaignState.Failed) {
            state = CampaignState.Failed;
            emit CampaignStateChanged(CampaignState.Failed);
        }

        // Interaction (safe call)
        (bool success, ) = payable(msg.sender).call{value: contribution}("");
        require(success, "Refund ETH transfer failed");

        emit RefundClaimed(msg.sender, contribution);
    }

    /**
     * @notice Creator or Guardian proposes a milestone fund release.
     * @param _title Title of milestone (e.g. "Milestone 1: Smart Contract Audit & Alpha")
     * @param _description Deliverables and technical specs
     * @param _proofUrl Verifiable link to Github, IPFS, or audit report
     * @param _requestedAmount ETH requested from escrow for this milestone
     */
    function proposeMilestone(
        string memory _title,
        string memory _description,
        string memory _proofUrl,
        uint256 _requestedAmount
    ) external nonReentrant returns (uint256) {
        require(msg.sender == creator || backers[msg.sender].tier == Tier.Guardian, "Only creator or Guardian backer can propose");
        require(totalRaised >= goalAmount, "Campaign goal was not reached");
        require(_requestedAmount > 0, "Requested amount must be > 0");
        
        uint256 availableEscrow = address(this).balance;
        require(_requestedAmount <= availableEscrow, "Requested amount exceeds escrow balance");

        proposalCounter++;
        uint256 proposalId = proposalCounter;

        proposals[proposalId] = MilestoneProposal({
            id: proposalId,
            title: _title,
            description: _description,
            proofUrl: _proofUrl,
            requestedAmount: _requestedAmount,
            votingDeadline: block.timestamp + votingDuration,
            forVotesSqrt: 0,
            againstVotesSqrt: 0,
            voterCount: 0,
            executed: false,
            passed: false
        });

        emit MilestoneProposed(proposalId, _title, _requestedAmount, block.timestamp + votingDuration);
        return proposalId;
    }

    /**
     * @notice Cast a Quadratic Vote on an active milestone proposal.
     *         Vote weight = sqrt(governance tokens held).
     *         Prevents whale dominance and ensures democratic governance.
     */
    function castVote(uint256 _proposalId, bool _support) external onlyBacker whenNotPaused nonReentrant {
        MilestoneProposal storage proposal = proposals[_proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp < proposal.votingDeadline, "Voting deadline has passed");
        require(!hasVotedOnProposal[_proposalId][msg.sender], "Already voted on this proposal");

        uint256 tokenBalance = address(governanceToken) != address(0) 
            ? governanceToken.balanceOf(msg.sender) 
            : backers[msg.sender].tokenAllocation;

        require(tokenBalance > 0, "No voting weight available");

        // Quadratic voting weight = sqrt(tokenBalance)
        uint256 quadWeight = tokenBalance.sqrt();
        require(quadWeight > 0, "Voting power is zero");

        hasVotedOnProposal[_proposalId][msg.sender] = true;
        proposal.voterCount++;

        if (_support) {
            proposal.forVotesSqrt += quadWeight;
        } else {
            proposal.againstVotesSqrt += quadWeight;
        }

        emit VoteCast(_proposalId, msg.sender, _support, quadWeight);
    }

    /**
     * @notice Execute an approved milestone proposal and disburse funds from escrow to creator.
     */
    function executeMilestone(uint256 _proposalId) external nonReentrant {
        MilestoneProposal storage proposal = proposals[_proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp >= proposal.votingDeadline, "Voting period still active");
        require(!proposal.executed, "Proposal already executed");
        
        // Quorum and approval check: For votes must strictly exceed Against votes
        require(proposal.forVotesSqrt > proposal.againstVotesSqrt, "Proposal was rejected by DAO voters");
        require(proposal.voterCount > 0, "Zero voter participation");
        require(address(this).balance >= proposal.requestedAmount, "Insufficient escrow balance");

        // Checks-Effects
        proposal.passed = true;
        proposal.executed = true;
        fundsReleased += proposal.requestedAmount;

        // Interaction (Transfer to creator)
        (bool success, ) = creator.call{value: proposal.requestedAmount}("");
        require(success, "Disbursement transfer failed");

        emit MilestoneExecuted(_proposalId, proposal.requestedAmount, creator);
    }

    /**
     * @notice Emergency Pause mechanism (Circuit Breaker) in case of security threat.
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Total backers count helper.
     */
    function getBackerCount() external view returns (uint256) {
        return backerAddresses.length;
    }

    /**
     * @notice Calculate quadratic voting weight for any token amount.
     */
    function calculateQuadraticWeight(uint256 _tokenAmount) external pure returns (uint256) {
        return _tokenAmount.sqrt();
    }

    /**
     * @notice Get full campaign status.
     */
    function getCampaignSummary() external view returns (
        string memory _title,
        address _creator,
        uint256 _goal,
        uint256 _hardCap,
        uint256 _totalRaised,
        uint256 _fundsReleased,
        uint256 _escrowBalance,
        uint256 _deadline,
        CampaignState _state,
        uint256 _backerCount,
        uint256 _proposalCount
    ) {
        return (
            title,
            creator,
            goalAmount,
            hardCapAmount,
            totalRaised,
            fundsReleased,
            address(this).balance,
            deadline,
            state,
            backerAddresses.length,
            proposalCounter
        );
    }

    receive() external payable {
        revert("Use pledge() function to contribute with tier perks");
    }
}
