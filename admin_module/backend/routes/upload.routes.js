import express from 'express'
import { upload } from '../middleware/upload.middleware.js'
import { saveMediaFileService } from '../services/media.service.js'
import { generateThumbnailService } from '../services/image-processing.service.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

const router = express.Router()

// ============================================
// PRODUCT IMAGE UPLOAD
// ============================================
router.post('/product-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, {
                statusCode: 400,
                message: 'No file uploaded'
            })
        }

        // ========================================
        // GENERATE THUMBNAIL
        // ========================================
        const thumbnailPath = await generateThumbnailService(req.file.path)

        // ========================================
        // SAVE FILE METADATA
        // ========================================
        const media = await saveMediaFileService({
            file_name: req.file.filename,
            original_name: req.file.originalname,
            mime_type: req.file.mimetype,
            file_size: req.file.size,
            file_path: req.file.path,
            thumbnail_path: thumbnailPath
        })

        // ========================================
        // RESPONSE
        // ========================================
        successResponse(res, {
            message: 'Product image uploaded and processed successfully',
            data: media
        })
    } catch (error) {
        errorResponse(res, {
            statusCode: error.statusCode || 500,
            message: 'Failed to upload product image',
            error: error.message
        })
    }
})

export default router