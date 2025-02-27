// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GovToken is ERC20, Ownable {
    mapping(address => bool) public authorizedContracts;

    event Mint(address indexed to, uint256 amount);
    event ContractAuthorized(address indexed contractAddress);
    event ContractRevoked(address indexed contractAddress);

    constructor() ERC20("GovToken", "GVT") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit Mint(to, amount);
    }

    function authorizeContract(address _contract) external onlyOwner {
        require(_contract != address(0), "Invalid contract address");
        authorizedContracts[_contract] = true;
        emit ContractAuthorized(_contract);
    }

    function revokeContract(address _contract) external onlyOwner {
        require(authorizedContracts[_contract], "Contract not authorized");
        authorizedContracts[_contract] = false;
        emit ContractRevoked(_contract);
    }

    function _update(address from, address to, uint256 amount) internal override {
        if (from != address(0) && to != address(0)) {
            require(authorizedContracts[msg.sender], "Transfers restricted to authorized contracts");
        }
        super._update(from, to, amount);
    }
}
