
import express from 'express'

import {
    createRefundController
} from '../controllers/refund.controller.js'

const router = express.Router()

// ============================================
// CREATE REFUND
// ============================================

router.post(
    '/',
    createRefundController
)

export default router