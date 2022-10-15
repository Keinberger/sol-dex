// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

// NOTE: owner of this contract is deployer by default
contract CommonProxyAdmin is ProxyAdmin {
    constructor(address) ProxyAdmin() {}
}
