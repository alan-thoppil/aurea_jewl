import {

    createRazorpayOrderService,

    verifyPaymentService

} from '../services/razorpay.service.js'

// ============================================
// CREATE ORDER
// ============================================

export const createRazorpayOrderController =
    async (req, res) => {

        try {

            const result =
                await createRazorpayOrderService(
                    req.body
                )

            res.json({
                success: true,
                data: result
            })

        } catch (error) {

            res.status(500).json({
                success: false,
                error: error.message
            })

        }

    }

// ============================================
// VERIFY PAYMENT
// ============================================

export const verifyPaymentController =
    async (req, res) => {

        try {

            const verified =
                await verifyPaymentService(
                    req.body
                )

            res.json({
                success: verified
            })

        } catch (error) {

            res.status(500).json({
                success: false,
                error: error.message
            })

        }

    }