function calculateGST(amount, gstRate = 3) {

    const gstAmount =
        (amount * gstRate) / 100

    const totalAmount =
        amount + gstAmount

    return {
        baseAmount: amount,
        gstRate,
        gstAmount,
        totalAmount
    }
}

module.exports = {
    calculateGST
}