const { ethers } = require("hardhat")

const constants = {
    developmentChains: ["hardhat", "localhost"],
    testNetChains: ["mumbai"],
    NULL_ADDRESS: ethers.constants.AddressZero,
    FRONTEND_FILE_PATH: "../frontend/constants/",
    proxyAdminName: "CommonProxyAdmin",
    MIN_DELAY: 10, // unit in seconds (after queuing up, execution will be available after this delay)
    VOTING_DELAY: 1, // unit in blocks, (how long after a proposal is created should voting power be fixed)
    VOTING_PERIOD: 25, // unit in blocks, (how long the proposal will be open for votes)
    scriptsConfig: {
        governance: {
            targetNameOrAbi: "", // for abi
            targetAddress: "", // dex proxy addr
            functionToCall: "",
            etherValue: 0,
            args: [],
            description: "",
            proposalsFile: "./scripts/governance/proposals.json",
            proposalIndex: 0,
            voteWay: 1,
        },
        // for liquidity pool initialization (when creating/adding new one)
        fundTimelock: {
            etherValue: 0,
            tokenAddress: "",
            tokenValue: 0,
        },
        dex: {
            address: "",
            amount: ethers.utils.parseEther("0"), // any
            direction: 1, // 0 or 1
        },
        nlp: {
            addLiquidity: {
                lpAddress: "",
                nativeAmount: ethers.utils.parseEther("0"),
            },
            removeLiquidity: {
                lpAddress: "",
                liquidityAmount: "",
            },
            swap: {
                direction: 0,
                amount: ethers.utils.parseEther("0"),
            },
        },
        tlp: {
            addLiquidity: {
                lpAddress: "",
                xAmount: ethers.utils.parseEther("0"),
            },
            removeLiquidity: {
                lpAddress: "",
                liquidityAmount: ethers.utils.parseEther("0"),
            },
            swap: {
                direction: 0,
                amount: ethers.utils.parseEther("0"),
            },
        },
    },
}

const contractsConfig = {
    TokenLiquidityPool: {
        name: "TokenLiquidityPool",
        args: {
            xAddress: "", // set by deploy script or DEX
            yAddress: "", // set by deploy script or DEX
            swapFee: 5,
        },
    },
    NativeLiquidityPool: {
        name: "NativeLiquidityPool",
        args: {
            tokenAddress: "", // set by deploy script or DEX
            swapFee: 5,
        },
    },
    DEX: {
        // needs to be initialized
        name: "DEX",
        args: {},
    },
    GovernanceToken: {
        // needs to be initialzed
        name: "DexGovernanceToken",
        args: {
            name: "DexGovernanceToken",
            symbol: "DGT",
            maxSupply: ethers.utils.parseEther("1000000"),
        },
    },
    Timelock: {
        // needs to be initialized
        name: "Timelock",
        args: {
            minDelay: constants.MIN_DELAY,
            proposers: [], // set by 05-setup.js script (proposer is governor contract only)
            executors: [], // set by 05-setup.js script (is null address => everyone can execute)
        },
    },
    Governor: {
        // needs to be initialized
        name: "DexGovernor",
        args: {
            Token: {},
            TimeLockController: {},
            name: "DexGovernor",
            votingDelay: constants.VOTING_DELAY,
            votingPeriod: constants.VOTING_PERIOD,
            quorumPercentage: 4,
        },
    },
}

const networkConfig = {
    137: {
        name: "polygon",
        contracts: contractsConfig,
    },
    80001: {
        name: "mumbai",
        contracts: contractsConfig,
        forTests: [
            { name: "aToken", args: [ethers.utils.parseEther("1000000")] },
            { name: "bToken", args: [ethers.utils.parseEther("1000000")] },
        ],
    },
    31337: {
        name: "hardhat",
        forTests: [
            { name: "aToken", args: [ethers.utils.parseEther("1000000")] },
            { name: "bToken", args: [ethers.utils.parseEther("1000000")] },
            { name: "DEXV2", args: [] },
            { name: "V2", args: [] },
            { name: "TokenLiquidityPool", args: ["", "", 5] },
            { name: "NativeLiquidityPool", args: ["", 5] },
        ],
        contracts: contractsConfig,
    },
}

module.exports = {
    constants,
    networkConfig,
}
