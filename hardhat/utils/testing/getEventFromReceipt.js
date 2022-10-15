const { ethers } = require("hardhat")

const getEventFromReceipt = (receipt, eventAbi, eventName) => {
    const interface = new ethers.utils.Interface([eventAbi])
    const data = receipt.logs[0].data
    const topics = receipt.logs[0].topics
    return interface.decodeEventLog(eventName, data, topics)
}

module.exports = getEventFromReceipt
