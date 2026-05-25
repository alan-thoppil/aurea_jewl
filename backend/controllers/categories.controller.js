import {

    getAllCategoriesService,

    createCategoryService

} from '../services/categories.service.js'

// ============================================
// GET ALL CATEGORIES
// ============================================

export const getAllCategoriesController =
    async (req, res) => {

        try {

            const result =
                await getAllCategoriesService()

            res.json({

                success: true,

                data: result

            })

        } catch (error) {

            res.status(500).json({

                success: false,

                error:
                    error.message

            })

        }

    }

// ============================================
// CREATE CATEGORY
// ============================================

export const createCategoryController =
    async (req, res) => {

        try {

            const result =
                await createCategoryService(
                    req.body
                )

            res.status(201).json({

                success: true,

                data: result

            })

        } catch (error) {

            res.status(500).json({

                success: false,

                error:
                    error.message

            })

        }

    }