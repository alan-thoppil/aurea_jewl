import express from 'express'

import {

    getSystemHealthController

} from '../controllers/monitoring.controller.js'

const router = express.Router()

// ============================================
// SYSTEM HEALTH
// ============================================

router.get(
    '/health',
    getSystemHealthController
)

export default router