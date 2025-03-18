// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable(msg.sender) {
    constructor() ERC20("MyToken", "MTK") {}

    // Minting function: Only the contract owner can mint tokens
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Override transfer function to restrict direct transfers
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(msg.sender == address(this), "Direct transfers not allowed");
        return super.transfer(recipient, amount);
    }

    // Contract-controlled transfer function
    function contractTransfer(address recipient, uint256 amount) external onlyOwner {
        _transfer(address(this), recipient, amount);
    }
}
