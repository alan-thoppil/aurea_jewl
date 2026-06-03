import express
    from 'express'

import {

    getDashboardController

} from '../controllers/dashboard.controller.js'

import {

    authenticateUser

} from '../middleware/auth.middleware.js'

import {

    adminOnly

} from '../middleware/admin.middleware.js'

const router =
    express.Router()

// ============================================
// ADMIN DASHBOARD
// ============================================

router.get(

    '/',

    authenticateUser,

    adminOnly,

    getDashboardController

)

export default router
