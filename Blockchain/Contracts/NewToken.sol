// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GovToken is ERC20, Ownable {
    event Mint(address indexed to, uint256 amount);

    constructor() ERC20("GovToken", "GVT") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "GovToken: Minting to zero address is not allowed");
        require(amount > 0, "GovToken: Minting amount must be greater than zero");

        _mint(to, amount);
        emit Mint(to, amount);
    }

    function balance(address account) external view returns (uint256) {
        return balanceOf(account);
    }

    function _update(address from, address to, uint256 amount) internal override {
        require(amount > 0, "GovToken: Transfer amount must be greater than zero");
        super._update(from, to, amount);
    }
}
