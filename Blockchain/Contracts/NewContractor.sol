// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ContractorFund is Ownable {
    IERC20 public govToken; // The ERC-20 token used for transactions

    // Struct to store transaction details
    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        string description; // e.g., "CentralToState", "StateToContractor", etc.
        uint256 timestamp;
    }

    // Mapping to store transactions for each contract ID
    mapping(string => Transaction[]) public transactions;

    // Events to track fund transfers
    event FundTransferred(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        string contractID,
        string description
    );

    constructor(address _govToken) Ownable(msg.sender) {
        require(_govToken != address(0), "Invalid token address");
        govToken = IERC20(_govToken);
    }

    // Modifier to restrict access to the central government
    modifier onlyCentralGovernment() {
        require(msg.sender == owner(), "Only Central Government can execute");
        _;
    }

    // Transfer funds from Central Government to State
    function transferToState(address state, uint256 amount, string memory contractID) external onlyCentralGovernment {
        require(state != address(0), "Invalid state address");
        require(amount > 0, "Amount must be greater than zero");
        require(govToken.transfer(state, amount), "Transfer to state failed");

        // Store the transaction
        transactions[contractID].push(Transaction({
            sender: msg.sender,
            receiver: state,
            amount: amount,
            description: "CentralToState",
            timestamp: block.timestamp
        }));

        emit FundTransferred(msg.sender, state, amount, contractID, "CentralToState");
    }

    // Transfer funds from State to Contractor
    function transferToContractor(
        address contractor,
        uint256 amount,
        string memory contractID
    ) external {
        require(contractor != address(0), "Invalid contractor address");
        require(amount > 0, "Amount must be greater than zero");
        require(govToken.transfer(contractor, amount), "Transfer to contractor failed");

        // Store the transaction
        transactions[contractID].push(Transaction({
            sender: msg.sender,
            receiver: contractor,
            amount: amount,
            description: "StateToContractor",
            timestamp: block.timestamp
        }));

        emit FundTransferred(msg.sender, contractor, amount, contractID, "StateToContractor");
    }

    // Transfer funds from Contractor to Bank
    function transferToBank(address bank, uint256 amount, string memory contractID) external {
        require(bank != address(0), "Invalid bank address");
        require(amount > 0, "Amount must be greater than zero");
        require(govToken.transfer(bank, amount), "Transfer to bank failed");

        // Store the transaction
        transactions[contractID].push(Transaction({
            sender: msg.sender,
            receiver: bank,
            amount: amount,
            description: "ContractorToBank",
            timestamp: block.timestamp
        }));

        emit FundTransferred(msg.sender, bank, amount, contractID, "ContractorToBank");
    }

    // Transfer funds from Bank to Central Government
    function transferToCentralGovernment(uint256 amount, string memory contractID) external {
        require(amount > 0, "Amount must be greater than zero");
        require(govToken.transfer(owner(), amount), "Transfer to central government failed");

        // Store the transaction
        transactions[contractID].push(Transaction({
            sender: msg.sender,
            receiver: owner(),
            amount: amount,
            description: "BankToCentral",
            timestamp: block.timestamp
        }));

        emit FundTransferred(msg.sender, owner(), amount, contractID, "BankToCentral");
    }

    // Get all transactions for a specific contract ID
    function getTransactions(string memory contractID) external view returns (Transaction[] memory) {
        return transactions[contractID];
    }
}