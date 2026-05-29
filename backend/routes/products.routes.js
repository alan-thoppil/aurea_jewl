import express from 'express'

const router = express.Router()
import {
    searchProductsController,
    getAllProductsController,
    getProductByIdController,
    createProductController,
    updateProductController,
    deleteProductController
} from '../controllers/products.controller.js'
// ============================================
// PRODUCTS TEST
// ============================================

router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Products route working'
    })
})

// ============================================
// GET ALL PRODUCTS
// ============================================

router.get('/', getAllProductsController)
// ============================================
// CREATE PRODUCT
// ============================================

router.post('/', createProductController)

// ============================================
// GET PRODUCT BY ID
// ============================================

router.get('/:id', getProductByIdController)

// ============================================
// UPDATE PRODUCT
// ============================================

router.put('/:id', updateProductController)

// ============================================
// DELETE PRODUCT
// ============================================

router.delete('/:id', deleteProductController)
// ============================================
// SEARCH PRODUCTS
// ============================================

router.get(
    '/search',
    searchProductsController
)
export default router