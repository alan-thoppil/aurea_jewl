import express from 'express'

import { validate } from '../middleware/validation.middleware.js'

import { createPaymentSchema } from '../validators/payment.validator.js'

import {
    testPaymentsController,
    createPaymentController
} from '../controllers/payments.controller.js'
import {

    featureFlag

} from '../middleware/featureFlag.middleware.js'

const router = express.Router()

// ============================================
// TEST ROUTE
// ============================================

router.get('/test', testPaymentsController)

// ============================================
// CREATE PAYMENT
// ============================================

router.post(

    '/',

    featureFlag('payments'),
    validate(createPaymentSchema),
    createPaymentController
)

export default router