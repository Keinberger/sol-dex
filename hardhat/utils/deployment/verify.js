const { run } = require("hardhat")

const verify = async (addr, args, network) => {
    console.log("Verifying contract")
    try {
        await hre.run("verify:verify", {
            address: addr,
            constructorArguments: args,
            network: network,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Contract has already been verified")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }
