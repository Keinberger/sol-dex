// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "../DEX.sol";

contract DEXV2 is DEX {
    uint256 public newValue;

    function setNewValue(uint256 value) public {
        newValue = value;
    }

    function getNewVersion() public pure returns (uint8) {
        return 2;
    }
}
