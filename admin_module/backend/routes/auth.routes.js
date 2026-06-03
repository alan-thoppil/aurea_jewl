import express from 'express'

import {
    testAuthController,
    loginController
} from '../controllers/auth.controller.js'

import { validate } from '../middleware/validation.middleware.js'

import { loginSchema } from '../validators/auth.validator.js'
import {

    authLimiter

} from '../middleware/rateLimit.middleware.js'

const router = express.Router()

// ============================================
// TEST ROUTE
// ============================================

router.get('/test', testAuthController)

// ============================================
// LOGIN ROUTE
// ============================================

router.post(
    '/login',

    authLimiter,
    validate(loginSchema),
    loginController
)

export default router