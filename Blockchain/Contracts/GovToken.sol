// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FundToken is ERC20, Ownable {

    uint256 public tokenPriceInRs = 100; // 1 token = 100 Rs

    // Pass msg.sender explicitly to Ownable constructor
    constructor(uint256 initialSupply) ERC20("FundToken", "FTK") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * (10 ** decimals())); // Mint initial supply to deployer
    }

    function getTokenPriceInRs() public view returns (uint256) {
        return tokenPriceInRs;
    }

    function setTokenPriceInRs(uint256 newPrice) public onlyOwner {
        tokenPriceInRs = newPrice;
    }

    function mintTokensByAmountInRs(address to, uint256 amountInRs) public onlyOwner {
        uint256 tokenAmount = (amountInRs * (10 ** decimals())) / tokenPriceInRs;
        require(tokenAmount > 0, "Amount is too low to mint any tokens");
        _mint(to, tokenAmount);
    }
}
