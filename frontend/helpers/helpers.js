import { ethers } from "ethers"

export function trimNumber(num, decimals) {
    if (num.split(".")[1] == undefined) return num
    if (num.split(".")[1].length <= decimals) return num

    let formattedNum = String(Number(num).toFixed(decimals))

    if (formattedNum == 0) {
        let wholeNumDecimals = String(num).split(".")[1]
        let numTillChar
        for (let i = 0; i < wholeNumDecimals.length; i++) {
            if (wholeNumDecimals[i] != "0") {
                numTillChar = i + 1
                break
            }
        }

        if (numTillChar > decimals * 2) return "0"

        return String(Number(num).toFixed(numTillChar))
    }

    // rounding up
    let lastIndex = formattedNum.length - 1
    if (formattedNum[lastIndex] == "9") {
        for (let i = lastIndex; i < formattedNum.length; i--) {
            if (formattedNum[i] == "9") formattedNum = formattedNum.slice(0, -1)
            else break
        }
    }
    let lastCharacter = formattedNum[formattedNum.length - 1]
    formattedNum = formattedNum.slice(0, -1)
    formattedNum = formattedNum + String(Number(lastCharacter) + 1)

    let numDecimals = String(formattedNum).split(".")[1]
    for (let i = numDecimals.length - 1; i > 0; i--) {
        if (numDecimals[i] != "0") break

        formattedNum = formattedNum.slice(0, -1)
    }

    return formattedNum
}

export function getEthInverse(value) {
    const oneEther = ethers.utils.parseEther("1")
    return ethers.utils.parseEther(oneEther.toString()).div(value).toString()
}

export function convertToWei(num) {
    try {
        const wei = ethers.utils.parseEther(num)
        return wei.toString()
    } catch {
        return "0"
    }
}
