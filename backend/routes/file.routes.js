import express from 'express'

import {
    upload
} from '../middleware/upload.middleware.js'

import {
    uploadFileController
} from '../controllers/file.controller.js'

const router = express.Router()

// ============================================
// FILE UPLOAD
// ============================================

router.post(
    '/upload',
    upload.single('file'),
    uploadFileController
)

export default router