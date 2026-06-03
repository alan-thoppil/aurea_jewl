import express from 'express'

import {

    testOrdersController,

    createOrderController,

    updateOrderStatusController,

    cancelOrderController

} from '../controllers/orders.controller.js'

import {

    authenticateUser

} from '../middleware/auth.middleware.js'

import {

    validate

} from '../middleware/validation.middleware.js'

import {

    createOrderSchema

} from '../validators/order.validator.js'

const router = express.Router()

// ============================================
// TEST ROUTE
// ============================================

router.get(

    '/test',

    testOrdersController

)

// ============================================
// PROTECTED ROUTE
// ============================================

router.get(

    '/protected',

    authenticateUser,

    (req, res) => {

        res.json({

            success: true,

            message:
                'Protected orders route accessed',

            user: req.user

        })

    }

)

// ============================================
// CREATE ORDER
// ============================================

router.post(

    '/',

    validate(
        createOrderSchema
    ),

    createOrderController

)

// ============================================
// UPDATE ORDER STATUS
// ============================================

router.put(

    '/:id/status',

    updateOrderStatusController

)

// ============================================
// CANCEL ORDER
// ============================================

router.put(

    '/:id/cancel',

    cancelOrderController

)

export default router