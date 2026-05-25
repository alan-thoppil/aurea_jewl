import express from 'express'

import {

    getAllOrdersController,

    getAllProductsController,

    getAllCustomersController,

    getLowStockProductsController,

    searchProductsController,

    filterOrdersController,

    paginatedProductsController,

    paginatedOrdersController

} from '../controllers/admin.controller.js'

import {
    authenticateUser
} from '../middleware/auth.middleware.js'

import {
    adminOnly
} from '../middleware/admin.middleware.js'

const router = express.Router()

// ============================================
// APPLY ADMIN PROTECTION
// ============================================

router.use(
    authenticateUser
)

// ============================================
// TEMPORARILY DISABLED
// ENABLE LATER AFTER REAL RBAC
// ============================================

// router.use(
//   adminOnly
// )

// ============================================
// ADMIN ORDERS
// ============================================

router.get(
    '/orders',
    getAllOrdersController
)

// ============================================
// ADMIN PRODUCTS
// ============================================

router.get(
    '/products',
    getAllProductsController
)

// ============================================
// ADMIN CUSTOMERS
// ============================================

router.get(
    '/customers',
    getAllCustomersController
)

// ============================================
// LOW STOCK PRODUCTS
// ============================================

router.get(
    '/low-stock',
    getLowStockProductsController
)

// ============================================
// SEARCH PRODUCTS
// ============================================

router.get(
    '/search-products',
    searchProductsController
)

// ============================================
// FILTER ORDERS
// ============================================

router.get(
    '/filter-orders',
    filterOrdersController
)

// ============================================
// PAGINATED PRODUCTS
// ============================================

router.get(
    '/paginated-products',
    paginatedProductsController
)

// ============================================
// PAGINATED ORDERS
// ============================================

router.get(
    '/paginated-orders',
    paginatedOrdersController
)

export default router