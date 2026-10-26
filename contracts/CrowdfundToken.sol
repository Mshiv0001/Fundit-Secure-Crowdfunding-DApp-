// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CrowdfundToken
 * @notice Governance token minted proportionally when backers support a campaign.
 *         Tokens grant Quadratic Voting power on milestone fund release proposals.
 */
contract CrowdfundToken is ERC20, Ownable {
    address public crowdfundingContract;

    event CrowdfundingContractSet(address indexed newAddress);

    modifier onlyCrowdfunding() {
        require(msg.sender == crowdfundingContract, "Only crowdfunding contract can mint/burn");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address _owner
    ) ERC20(name, symbol) Ownable(_owner) {}

    function setCrowdfundingContract(address _crowdfundingContract) external onlyOwner {
        require(_crowdfundingContract != address(0), "Invalid address");
        crowdfundingContract = _crowdfundingContract;
        emit CrowdfundingContractSet(_crowdfundingContract);
    }

    function mint(address to, uint256 amount) external onlyCrowdfunding {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyCrowdfunding {
        _burn(from, amount);
    }
}
