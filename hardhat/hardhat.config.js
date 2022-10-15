require("dotenv").config()

require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("solidity-coverage")
require("hardhat-deploy")
require("@primitivefi/hardhat-dodoc")

const MUMBAI_RPC_URL =
    process.env.RPC_URL !== undefined
        ? process.env.RPC_URL.replace("network", "polygon-mumbai")
        : ""
const MUMBAI_PRIVATE_KEY =
    process.env.MUMBAI_PRIVATE_KEY !== undefined ? process.env.MUMBAI_PRIVATE_KEY : ""
const POLYGON_RPC_URL =
    process.env.RPC_URL !== undefined
        ? process.env.RPC_URL.replace("network", "polygon-mainnet")
        : ""
const POLYGON_PRIVATE_KEY =
    process.env.POLYGON_PRIVATE_KEY !== undefined ? process.env.POLYGON_PRIVATE_KEY : ""
const EXPLORER_API_KEY = process.env.EXPLORER_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const REPORT_GAS = process.env.REPORT_GAS

module.exports = {
    solidity: {
        version: "0.8.7",
        defaultNetwork: "hardhat",
        // compilers: [{ version: "0.8.13", settings: { optimizer: { enabled: true, runs: 200 } } }],
        settings: {
            optimizer: {
                // => optimizer makes contract sizes smaller
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        localhost: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        mumbai: {
            chainId: 80001,
            blockConfirmations: 6,
            url: MUMBAI_RPC_URL,
            accounts: [MUMBAI_PRIVATE_KEY],
        },
        polygon: {
            chainId: 137,
            blockConfirmations: 6,
            url: POLYGON_RPC_URL,
            accounts: [POLYGON_PRIVATE_KEY],
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
    gasReporter: {
        enabled: REPORT_GAS,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "MATIC",
        excludeContracts: ["aToken", "bToken", "DEXV2", "V2"],
    },
    etherscan: {
        apiKey: EXPLORER_API_KEY,
    },
    dodoc: {
        runOnCompile: false,
        exclude: [
            "test",
            "governance",
            "proxy",
            "openzeppelin/contracts",
            "openzeppelin/contracts-upgradeable",
        ],
    },
    mocha: {
        timeout: 300000,
    },
}
