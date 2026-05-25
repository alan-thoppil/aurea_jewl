import {

    getAllProductsService,

    getProductByIdService,

    createProductService,

    updateProductService,

    deleteProductService,

    searchProductsService

} from '../services/products.service.js'

import {

    successResponse,

    errorResponse

} from '../utils/apiResponse.js'

// ============================================
// GET ALL PRODUCTS
// ============================================

export const getAllProductsController =
    async (req, res) => {

        try {

            const products =
                await getAllProductsService()

            successResponse(res, {

                message:
                    'Products fetched successfully',

                data:
                    products

            })

        } catch (error) {

            errorResponse(res, {

                message:
                    'Failed to fetch products',

                error:
                    error.message

            })

        }

    }

// ============================================
// GET PRODUCT BY ID
// ============================================

export const getProductByIdController =
    async (req, res) => {

        try {

            const product =
                await getProductByIdService(

                    req.params.id

                )

            successResponse(res, {

                message:
                    'Product fetched successfully',

                data:
                    product

            })

        } catch (error) {

            errorResponse(res, {

                message:
                    'Failed to fetch product',

                error:
                    error.message

            })

        }

    }

// ============================================
// CREATE PRODUCT
// ============================================

export const createProductController =
    async (req, res) => {

        try {

            const product =
                await createProductService(
                    req.body
                )

            successResponse(res, {

                statusCode: 201,

                message:
                    'Product created successfully',

                data:
                    product

            })

        } catch (error) {

            errorResponse(res, {

                message:
                    'Failed to create product',

                error:
                    error.message

            })

        }

    }

// ============================================
// UPDATE PRODUCT
// ============================================

export const updateProductController =
    async (req, res) => {

        try {

            const product =
                await updateProductService(

                    req.params.id,

                    req.body

                )

            successResponse(res, {

                message:
                    'Product updated successfully',

                data:
                    product

            })

        } catch (error) {

            errorResponse(res, {

                message:
                    'Failed to update product',

                error:
                    error.message

            })

        }

    }

// ============================================
// DELETE PRODUCT
// ============================================

export const deleteProductController =
    async (req, res) => {

        try {

            const result =
                await deleteProductService(

                    req.params.id

                )

            successResponse(res, {

                message:
                    'Product deleted successfully',

                data:
                    result

            })

        } catch (error) {

            errorResponse(res, {

                message:
                    'Failed to delete product',

                error:
                    error.message

            })

        }

    }

// ============================================
// SEARCH PRODUCTS
// ============================================

export const searchProductsController =
    async (req, res) => {

        try {

            const result =

                await searchProductsService({

                    search:
                        req.query.search,

                    minPrice:
                        Number(
                            req.query.minPrice
                        ) || 0,

                    maxPrice:
                        Number(
                            req.query.maxPrice
                        ) || 999999999,

                    sortBy:
                        req.query.sortBy
                        || 'created_at',

                    order:
                        req.query.order
                        || 'desc',

                    page:
                        Number(
                            req.query.page
                        ) || 1,

                    limit:
                        Number(
                            req.query.limit
                        ) || 10

                })

            successResponse(res, {

                message:
                    'Products fetched successfully',

                data:
                    result.products,

                pagination:
                    result.pagination

            })

        } catch (error) {

            errorResponse(res, {

                message:
                    'Failed to search products',

                error:
                    error.message

            })

        }

    }