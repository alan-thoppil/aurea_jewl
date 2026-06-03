import express
    from 'express'

import {

    adjustInventoryController,

    getInventoryMovementsController

} from '../controllers/inventory.controller.js'

const router =
    express.Router()

// ============================================
// ADJUST INVENTORY
// ============================================

router.post(
    '/adjust',
    adjustInventoryController
)

// ============================================
// INVENTORY MOVEMENTS
// ============================================

router.get(
    '/movements',
    getInventoryMovementsController
)

export default router