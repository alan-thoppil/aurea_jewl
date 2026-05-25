import {
    createRefundService
} from '../services/refund.service.js'

// ============================================
// CREATE REFUND CONTROLLER
// ============================================

export const createRefundController =
    async (req, res) => {

        try {

            const result =
                await createRefundService(req.body)

            res.json({
                success: true,
                message: 'Refund processed',
                data: result
            })

        } catch (error) {

            res.status(500).json({
                success: false,
                error: error.message
            })

        }

    }