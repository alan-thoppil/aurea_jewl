import express from 'express'

import {

    getDashboardAnalyticsController

} from '../controllers/analytics.controller.js'

const router = express.Router()

// ============================================
// DASHBOARD ANALYTICS
// ============================================

router.get(
    '/',
    getDashboardAnalyticsController
)

export default router