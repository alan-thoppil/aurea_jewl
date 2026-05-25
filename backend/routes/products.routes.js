import express from 'express'

const router = express.Router()
import {

    searchProductsController

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

router.get('/', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Get all products'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// ============================================
// GET PRODUCT BY ID
// ============================================

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params

        res.json({
            success: true,
            productId: id,
            message: 'Get product by ID'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})
// ============================================
// SEARCH PRODUCTS
// ============================================

router.get(
    '/search',
    searchProductsController
)
export default router