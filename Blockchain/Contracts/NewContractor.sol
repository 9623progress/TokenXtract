// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./NewToken.sol";

contract ContractorFund {
    GovToken public govToken;
    address public centralGovernment;
    mapping(string => bool) public processedStages;

    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        string contractId;
        string proof;
        string stageId;
        string applicationId;
        uint256 timestamp;
    }

    mapping(bytes32 => Transaction) public transactions; // Store transaction details by hash

    event FundTransferred(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        string contractId,
        string proof,
        string stageId,
        string applicationId,
        bytes32 transactionId
    );

    event TokensAcknowledged(address indexed contractor, uint256 amount, bytes32 transactionId);
    event TokensReturnedToGov(address indexed bank, uint256 amount, bytes32 transactionId);

    modifier onlyCentralGov() {
        require(msg.sender == centralGovernment, "Only central government allowed");
        _;
    }

    constructor(address _govToken) {
        govToken = GovToken(_govToken);
        centralGovernment = msg.sender;
    }

    function transferToState(address state, uint256 amount, string memory contractId) external onlyCentralGov {
        bytes32 transactionId = keccak256(abi.encodePacked(block.timestamp, msg.sender, state, amount));

        // Store transaction details
        transactions[transactionId] = Transaction(msg.sender, state, amount, contractId, "", "", "", block.timestamp);

        // Transfer funds
        govToken.transfer(state, amount);

        // Emit event
        emit FundTransferred(msg.sender, state, amount, contractId, "", "", "", transactionId);
    }

    function transferToContractor(
        address contractor,
        uint256 amount,
        string memory contractId,
        string memory proof,
        string memory stageId,
        string memory applicationId
    ) external returns (bytes32) {
        require(!processedStages[stageId], "Stage already processed");
        processedStages[stageId] = true;

        bytes32 transactionId = keccak256(abi.encodePacked(block.timestamp, msg.sender, contractor, amount));

        transactions[transactionId] = Transaction(msg.sender, contractor, amount, contractId, proof, stageId, applicationId, block.timestamp);

        govToken.transfer(contractor, amount);
        emit FundTransferred(msg.sender, contractor, amount, contractId, proof, stageId, applicationId, transactionId);

        return transactionId;
    }

    function contractorToBank(address bank, uint256 amount) external returns (bytes32) {
        bytes32 transactionId = keccak256(abi.encodePacked(block.timestamp, msg.sender, bank, amount));

        transactions[transactionId] = Transaction(msg.sender, bank, amount, "", "", "", "", block.timestamp);

        govToken.transfer(bank, amount);
        emit TokensAcknowledged(msg.sender, amount, transactionId);

        return transactionId;
    }

    function bankToCentralGov(uint256 amount) external returns (bytes32) {
        bytes32 transactionId = keccak256(abi.encodePacked(block.timestamp, msg.sender, centralGovernment, amount));

        transactions[transactionId] = Transaction(msg.sender, centralGovernment, amount, "", "", "", "", block.timestamp);

        govToken.transfer(centralGovernment, amount);
        emit TokensReturnedToGov(msg.sender, amount, transactionId);

        return transactionId;
    }
}
