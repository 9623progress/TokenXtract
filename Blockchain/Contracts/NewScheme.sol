// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./NewToken.sol";

contract SchemeHolderFund {
    GovToken public govToken;
    address public centralGovernment;

    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        string schemeId;
        string applicationId;
        uint256 timestamp;
    }

    mapping(bytes32 => Transaction) public transactions;

    event FundTransferred(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        string schemeId,
        string applicationId,
        bytes32 transactionId
    );

    event TokensAcknowledged(address indexed schemeHolder, uint256 amount, bytes32 transactionId);
    event TokensReturnedToGov(address indexed bank, uint256 amount, bytes32 transactionId);

    modifier onlyCentralGov() {
        require(msg.sender == centralGovernment, "Only central government allowed");
        _;
    }

    constructor(address _govToken) {
        govToken = GovToken(_govToken);
        centralGovernment = msg.sender;
    }

    function transferToState(address state, uint256 amount, string memory schemeId) external onlyCentralGov {
        bytes32 transactionId = keccak256(abi.encodePacked(block.timestamp, msg.sender, state, amount));

        // Store transaction details
        transactions[transactionId] = Transaction(msg.sender, state, amount, schemeId, "", block.timestamp);

        // Transfer funds
        govToken.transfer(state, amount);

        // Emit event
        emit FundTransferred(msg.sender, state, amount, schemeId, "", transactionId);
    }

    function transferToSchemeHolder(
        address schemeHolder,
        uint256 amount,
        string memory schemeId,
        string memory applicationId
    ) external returns (bytes32) {
        bytes32 transactionId = keccak256(abi.encodePacked(block.timestamp, msg.sender, schemeHolder, amount));

        transactions[transactionId] = Transaction(msg.sender, schemeHolder, amount, schemeId, applicationId, block.timestamp);

        govToken.transfer(schemeHolder, amount);
        emit FundTransferred(msg.sender, schemeHolder, amount, schemeId, applicationId, transactionId);

        return transactionId;
    }

    function schemeHolderToBank(address bank, uint256 amount) external returns (bytes32) {
        bytes32 transactionId = keccak256(abi.encodePacked(block.timestamp, msg.sender, bank, amount));

        transactions[transactionId] = Transaction(msg.sender, bank, amount, "", "", block.timestamp);

        govToken.transfer(bank, amount);
        emit TokensAcknowledged(msg.sender, amount, transactionId);

        return transactionId;
    }

    function bankToCentralGov(uint256 amount) external returns (bytes32) {
        bytes32 transactionId = keccak256(abi.encodePacked(block.timestamp, msg.sender, centralGovernment, amount));

        transactions[transactionId] = Transaction(msg.sender, centralGovernment, amount, "", "", block.timestamp);

        govToken.transfer(centralGovernment, amount);
        emit TokensReturnedToGov(msg.sender, amount, transactionId);

        return transactionId;
    }
}
