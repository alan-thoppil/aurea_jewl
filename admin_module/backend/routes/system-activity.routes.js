import express from 'express'

import {

    getSystemActivitiesController

} from '../controllers/system-activity.controller.js'

const router = express.Router()

// ============================================
// SYSTEM ACTIVITIES
// ============================================

router.get(
    '/',
    getSystemActivitiesController
)

export default router