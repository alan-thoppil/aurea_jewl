import express from 'express'
import {
    attachMediaToProductService,
    getProductMediaService
} from '../services/product-media.service.js'
import {
    successResponse,
    errorResponse
} from '../utils/apiResponse.js'

const router = express.Router()

// ============================================
// ATTACH MEDIA TO PRODUCT
// ============================================
router.post('/', async (req, res) => {
    try {
        const result = await attachMediaToProductService(req.body)
        successResponse(res, {
            message: 'Media attached to product successfully',
            data: result
        })
    } catch (error) {
        errorResponse(res, {
            statusCode: error.statusCode || 500,
            message: 'Failed to attach media to product',
            error: error.message
        })
    }
})

// ============================================
// GET PRODUCT MEDIA
// ============================================
router.get('/:productId', async (req, res) => {
    try {
        const result = await getProductMediaService(req.params.productId)
        successResponse(res, {
            message: 'Product media fetched successfully',
            data: result
        })
    } catch (error) {
        errorResponse(res, {
            statusCode: error.statusCode || 500,
            message: 'Failed to fetch product media',
            error: error.message
        })
    }
})

export default router