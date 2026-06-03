const crypto = require('crypto')

function verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    secret
) {

    const body =
        razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex')

    return expectedSignature === razorpay_signature
}

module.exports = {
    verifyPaymentSignature
}