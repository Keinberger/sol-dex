// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract aToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("aToken", "AT") {
        _mint(msg.sender, initialSupply);
    }
}
