import express
    from 'express'

import {

    getAllCategoriesController,

    createCategoryController

} from '../controllers/categories.controller.js'

const router =
    express.Router()

// ============================================
// GET CATEGORIES
// ============================================

router.get(
    '/',
    getAllCategoriesController
)

// ============================================
// CREATE CATEGORY
// ============================================

router.post(
    '/',
    createCategoryController
)

export default router