// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract UniversalTokenTransfer {
    address public centralGov;
    IERC20 public ftkToken;
    uint256 public transactionCounter = 0;

    struct Transaction {
        uint256 id;
        address sender;
        address receiver;
        uint256 amount;
        string uniqueId; // Scheme ID
        uint256 timestamp;
    }

    mapping(uint256 => Transaction) public transactions;
    mapping(string => uint256[]) public contractTransactions;
    mapping(address => mapping(string => uint256)) public lockedTokens;
    mapping(address => mapping(string => uint256)) public tokensReceived; // How much received for each scheme
    mapping(address => mapping(string => uint256)) public tokensSent;     // How much sent for each scheme

    event TokensTransferred(
        uint256 indexed id,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        string uniqueId,
        uint256 timestamp
    );

    modifier onlyCentralGov() {
        require(msg.sender == centralGov, "Only Central Government can perform this action.");
        _;
    }

    constructor(address _ftkTokenAddress) {
        centralGov = msg.sender;
        ftkToken = IERC20(_ftkTokenAddress);
    }

    // Universal Token Transfer Function
    function transferTokens(
        address sender,
        address receiver,
        uint256 amount,
        string memory uniqueId
    ) public {
        require(ftkToken.balanceOf(sender) >= amount, "Insufficient FTK balance.");
        require(ftkToken.transferFrom(sender, receiver, amount), "Token transfer failed.");

        // Track received and sent tokens
        tokensReceived[receiver][uniqueId] += amount;
        tokensSent[sender][uniqueId] += amount;

        // Lock tokens for project tracking (receiver side)
        lockedTokens[receiver][uniqueId] += amount;

        // Record transaction
        transactionCounter++;
        transactions[transactionCounter] = Transaction({
            id: transactionCounter,
            sender: sender,
            receiver: receiver,
            amount: amount,
            uniqueId: uniqueId,
            timestamp: block.timestamp
        });

        contractTransactions[uniqueId].push(transactionCounter);

        emit TokensTransferred(transactionCounter, sender, receiver, amount, uniqueId, block.timestamp);
    }

    // Get how many tokens an entity received for a scheme
    function getReceivedTokens(address account, string memory uniqueId) public view returns (uint256) {
        return tokensReceived[account][uniqueId];
    }

    // Get how many tokens an entity sent for a scheme
    function getSentTokens(address account, string memory uniqueId) public view returns (uint256) {
        return tokensSent[account][uniqueId];
    }

    // Get token balance of any account
    function getBalance(address account) public view returns (uint256) {
        return ftkToken.balanceOf(account);
    }

    // Get all transactions by unique scheme ID
    function getTransactionsByUniqueId(string memory uniqueId) public view returns (Transaction[] memory) {
        uint256[] memory ids = contractTransactions[uniqueId];
        Transaction[] memory results = new Transaction[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            results[i] = transactions[ids[i]];
        }

        return results;
    }

    // Get total tokens spent for a particular scheme
    function getTotalTokensSpent(string memory uniqueId) public view returns (uint256 totalSpent) {
        uint256[] memory ids = contractTransactions[uniqueId];
        for (uint256 i = 0; i < ids.length; i++) {
            totalSpent += transactions[ids[i]].amount;
        }
    }
}
