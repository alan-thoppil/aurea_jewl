import crypto from 'crypto'

import { razorpay }
    from '../config/razorpay.js'

// ============================================
// CREATE RAZORPAY ORDER
// ============================================

export const createRazorpayOrderService =
    async ({
        amount,
        currency = 'INR'
    }) => {

        // ==========================================
        // CREATE ORDER
        // ==========================================

        const order =
            await razorpay.orders.create({

                amount:
                    amount * 100,

                currency,

                receipt:
                    `receipt_${Date.now()}`

            })

        return order

    }

// ============================================
// VERIFY PAYMENT SIGNATURE
// ============================================

export const verifyPaymentService =
    async ({

        razorpay_order_id,

        razorpay_payment_id,

        razorpay_signature

    }) => {

        // ==========================================
        // CREATE SIGNATURE
        // ==========================================

        const generatedSignature =
            crypto
                .createHmac(
                    'sha256',
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest('hex')

        // ==========================================
        // VERIFY
        // ==========================================

        return (
            generatedSignature ===
            razorpay_signature
        )

    }