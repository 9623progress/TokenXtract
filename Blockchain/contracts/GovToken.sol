// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GovFundToken is ERC20, Ownable {
    uint256 public constant CONVERSION_RATE = 1; // 1 Rs = 1 Token

    constructor() ERC20("GovFundToken", "GFT") Ownable(msg.sender) {}

    // ✅ Function for government to mint tokens (1 Rs = 1 Token)
    function mintTokens(uint256 amountInRs) public onlyOwner {
        require(amountInRs > 0, "Amount must be greater than zero");
        _mint(msg.sender, amountInRs * CONVERSION_RATE * (10 ** decimals()));
    }

    // ✅ Function to check the total supply of created tokens
    function getTotalSupply() public view returns (uint256) {
        return totalSupply();
    }
}
