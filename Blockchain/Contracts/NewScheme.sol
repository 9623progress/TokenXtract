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
        string applicationId
    );

    event TokensAcknowledged(address indexed schemeHolder, uint256 amount);
    event TokensReturnedToGov(address indexed bank, uint256 amount);

    modifier onlyCentralGov() {
        require(msg.sender == centralGovernment, "SchemeHolderFund: Only central government is allowed to perform this action");
        _;
    }

    constructor(address _govToken) {
        require(_govToken != address(0), "SchemeHolderFund: Invalid token contract address");

        govToken = GovToken(_govToken);
        centralGovernment = msg.sender;
    }

    function transferToState(address state, uint256 amount, string memory schemeId) external onlyCentralGov {
        require(state != address(0), "SchemeHolderFund: Invalid state address");
        require(amount > 0, "SchemeHolderFund: Transfer amount must be greater than zero");

        govToken.transfer(state, amount);
        emit FundTransferred(msg.sender, state, amount, schemeId, "N/A");
    }

    function transferToSchemeHolder(
        address schemeHolder,
        uint256 amount,
        string memory schemeId,
        string memory applicationId
    ) external {
        require(schemeHolder != address(0), "SchemeHolderFund: Invalid scheme holder address");
        require(amount > 0, "SchemeHolderFund: Transfer amount must be greater than zero");

        govToken.transfer(schemeHolder, amount);
        emit FundTransferred(msg.sender, schemeHolder, amount, schemeId, applicationId);
    }

    function transferToBank(
        address bank,
        uint256 amount,
        string memory schemeId,
        string memory applicationId
    ) external {
        require(bank != address(0), "SchemeHolderFund: Invalid bank address");
        require(amount > 0, "SchemeHolderFund: Transfer amount must be greater than zero");

        govToken.transferFrom(msg.sender, bank, amount);
        emit FundTransferred(msg.sender, bank, amount, schemeId, applicationId);
    }

    function transferToCentralGov(address bank, uint256 amount) external {
        require(msg.sender == bank, "SchemeHolderFund: Only bank can return funds to the central government");
        require(amount > 0, "SchemeHolderFund: Transfer amount must be greater than zero");

        govToken.transferFrom(bank, centralGovernment, amount);
        emit TokensReturnedToGov(bank, amount);
    }
}
