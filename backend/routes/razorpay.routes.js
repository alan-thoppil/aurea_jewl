import express from 'express'

import {

  createRazorpayOrderController,

  verifyPaymentController

} from '../controllers/razorpay.controller.js'

const router = express.Router()

// ============================================
// CREATE ORDER
// ============================================

router.post(
  '/create-order',
  createRazorpayOrderController
)

// ============================================
// VERIFY PAYMENT
// ============================================

router.post(
  '/verify-payment',
  verifyPaymentController
)

export default router