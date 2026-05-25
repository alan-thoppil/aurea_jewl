import crypto from 'crypto'

// ============================================
// RAZORPAY WEBHOOK
// ============================================

export const razorpayWebhookController =
    async (req, res) => {

        try {

            // ========================================
            // SIGNATURE
            // ========================================

            const signature =
                req.headers[
                'x-razorpay-signature'
                ]

            // ========================================
            // GENERATE EXPECTED SIGNATURE
            // ========================================

            const expectedSignature =
                crypto
                    .createHmac(

                        'sha256',

                        process.env
                            .RAZORPAY_KEY_SECRET

                    )
                    .update(
                        JSON.stringify(req.body)
                    )
                    .digest('hex')

            // ========================================
            // VERIFY SIGNATURE
            // ========================================

            if (
                signature !== expectedSignature
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Invalid webhook signature'

                })

            }

            // ========================================
            // EVENT TYPE
            // ========================================

            const event =
                req.body.event

            console.log(
                `Webhook Event: ${event}`
            )

            // ========================================
            // HANDLE EVENTS
            // ========================================

            switch (event) {

                // ======================================
                // PAYMENT CAPTURED
                // ======================================

                case 'payment.captured':

                    console.log(
                        'Payment successful'
                    )

                    break

                // ======================================
                // PAYMENT FAILED
                // ======================================

                case 'payment.failed':

                    console.log(
                        'Payment failed'
                    )

                    break

                default:

                    console.log(
                        'Unhandled webhook event'
                    )

            }

            // ========================================
            // SUCCESS RESPONSE
            // ========================================

            return res.json({

                success: true

            })

        } catch (error) {

            return res.status(500).json({

                success: false,

                error: error.message

            })

        }

    }