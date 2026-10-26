// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SecureCrowdfundingDAO.sol";
import "./CrowdfundToken.sol";

/**
 * @title CrowdfundingFactory
 * @notice Factory registry that creates and tracks secure DAO crowdfunding campaigns.
 */
contract CrowdfundingFactory {
    struct CampaignRecord {
        address campaignAddress;
        address tokenAddress;
        address creator;
        string title;
        uint256 createdAt;
    }

    struct CreateCampaignArgs {
        string title;
        string description;
        string category;
        string imageUrl;
        uint256 goalAmount;
        uint256 hardCapAmount;
        uint256 durationSeconds;
        string tokenName;
        string tokenSymbol;
    }

    CampaignRecord[] public deployedCampaigns;
    mapping(address => address[]) public creatorCampaigns;

    event CampaignCreated(
        address indexed campaignAddress,
        address indexed tokenAddress,
        address indexed creator,
        string title,
        uint256 goalAmount,
        uint256 deadline
    );

    /**
     * @notice Create a new secure crowdfunding campaign with dedicated DAO governance token.
     */
    function createCampaign(CreateCampaignArgs calldata args) external returns (address campaignAddr, address tokenAddr) {
        // Deploy governance token
        CrowdfundToken token = new CrowdfundToken(args.tokenName, args.tokenSymbol, address(this));

        // Prepare init params for campaign contract
        SecureCrowdfundingDAO.CampaignInitParams memory initParams = SecureCrowdfundingDAO.CampaignInitParams({
            title: args.title,
            description: args.description,
            category: args.category,
            imageUrl: args.imageUrl,
            creator: payable(msg.sender),
            goalAmount: args.goalAmount,
            hardCapAmount: args.hardCapAmount,
            durationSeconds: args.durationSeconds,
            tokenAddress: address(token),
            guardianOwner: msg.sender
        });

        // Deploy campaign contract
        SecureCrowdfundingDAO campaign = new SecureCrowdfundingDAO(initParams);

        // Authorize campaign contract to mint/burn tokens
        token.setCrowdfundingContract(address(campaign));

        // Transfer token ownership to creator
        token.transferOwnership(msg.sender);

        campaignAddr = address(campaign);
        tokenAddr = address(token);

        CampaignRecord memory record = CampaignRecord({
            campaignAddress: campaignAddr,
            tokenAddress: tokenAddr,
            creator: msg.sender,
            title: args.title,
            createdAt: block.timestamp
        });

        deployedCampaigns.push(record);
        creatorCampaigns[msg.sender].push(campaignAddr);

        emit CampaignCreated(
            campaignAddr,
            tokenAddr,
            msg.sender,
            args.title,
            args.goalAmount,
            block.timestamp + args.durationSeconds
        );
    }

    function getAllCampaigns() external view returns (CampaignRecord[] memory) {
        return deployedCampaigns;
    }

    function getCampaignCount() external view returns (uint256) {
        return deployedCampaigns.length;
    }

    function getCampaignsByCreator(address _creator) external view returns (address[] memory) {
        return creatorCampaigns[_creator];
    }
}
