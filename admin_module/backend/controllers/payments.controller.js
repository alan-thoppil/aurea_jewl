import {

    createPaymentService

} from '../services/payments.service.js'

import {

    successResponse,

    errorResponse

} from '../utils/apiResponse.js'

// ============================================
// TEST PAYMENTS CONTROLLER
// ============================================

export const testPaymentsController =
    async (req, res) => {

        try {

            successResponse(res, {

                message:
                    'Payments controller working'

            })

        } catch (error) {

            errorResponse(res, {

                message:
                    'Payments controller failed',

                error:
                    error.message

            })

        }

    }

// ============================================
// CREATE PAYMENT CONTROLLER
// ============================================

export const createPaymentController =
    async (req, res) => {

        try {

            const result =
                await createPaymentService(
                    req.body
                )

            successResponse(res, {

                message:
                    'Payment created successfully',

                data:
                    result

            })

        } catch (error) {

            errorResponse(res, {

                message:
                    'Failed to create payment',

                error:
                    error.message

            })

        }

    }