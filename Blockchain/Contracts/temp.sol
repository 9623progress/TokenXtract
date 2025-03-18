// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleGVTTransfer {
    IERC20 public govToken; // The GVT token contract

    // Event to track transfers
    event TokensTransferred(
        address indexed sender,
        address indexed receiver,
        uint256 amount
    );

    // Constructor to initialize the GVT token address
    constructor(address _govToken) {
        require(_govToken != address(0), "Invalid token address");
        govToken = IERC20(_govToken);
    }

    // Function to transfer GVT tokens from the sender to the receiver
    function transferTokens(address receiver, uint256 amount) external {
        require(receiver != address(0), "Invalid receiver address");
        require(amount > 0, "Amount must be greater than zero");

        // Transfer tokens from the sender to the receiver
        bool success = govToken.transferFrom(msg.sender, receiver, amount);
        require(success, "Token transfer failed");

        // Emit an event to track the transfer
        emit TokensTransferred(msg.sender, receiver, amount);
    }
}