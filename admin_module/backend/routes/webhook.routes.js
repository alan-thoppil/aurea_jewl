import express from 'express'

import {

    razorpayWebhookController

} from '../controllers/webhook.controller.js'

const router = express.Router()

// ============================================
// RAZORPAY WEBHOOK
// ============================================

router.post(
    '/razorpay',
    razorpayWebhookController
)

export default router