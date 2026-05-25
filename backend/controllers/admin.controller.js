import { supabase } from '../config/supabase.js'

// ============================================
// GET ALL ORDERS
// ============================================

export const getAllOrdersController =
    async (req, res) => {

        try {

            const {
                data,
                error
            } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', {
                    ascending: false
                })

            if (error) {
                throw new Error(error.message)
            }

            res.json({
                success: true,
                data
            })

        } catch (error) {

            res.status(500).json({
                success: false,
                error: error.message
            })

        }

    }

// ============================================
// GET ALL PRODUCTS
// ============================================

export const getAllProductsController =
    async (req, res) => {

        try {

            const {
                data,
                error
            } = await supabase
                .from('products')
                .select('*')

            if (error) {
                throw new Error(error.message)
            }

            res.json({
                success: true,
                data
            })

        } catch (error) {

            res.status(500).json({
                success: false,
                error: error.message
            })

        }

    }

// ============================================
// GET ALL CUSTOMERS
// ============================================

export const getAllCustomersController =
    async (req, res) => {

        try {

            const {
                data,
                error
            } = await supabase
                .from('customers')
                .select('*')

            if (error) {
                throw new Error(error.message)
            }

            res.json({
                success: true,
                data
            })

        } catch (error) {

            res.status(500).json({
                success: false,
                error: error.message
            })

        }

    }

// ============================================
// GET LOW STOCK PRODUCTS
// ============================================

export const getLowStockProductsController =
    async (req, res) => {

        try {

            const {
                data,
                error
            } = await supabase
                .from('inventory')
                .select('*')
                .lte('quantity', 5)

            if (error) {
                throw new Error(error.message)
            }

            res.json({
                success: true,
                data
            })

        } catch (error) {

            res.status(500).json({
                success: false,
                error: error.message
            })

        }

    }
// ============================================
// SEARCH PRODUCTS
// ============================================

export const searchProductsController =
    async (req, res) => {

        try {

            const {
                search,
                category
            } = req.query

            let query =
                supabase
                    .from('products')
                    .select('*')

            // ========================================
            // SEARCH FILTER
            // ========================================

            if (search) {

                query =
                    query.ilike(
                        'name',
                        `%${search}%`
                    )

            }

            // ========================================
            // CATEGORY FILTER
            // ========================================

            if (category) {

                query =
                    query.eq(
                        'category',
                        category
                    )

            }

            // ========================================
            // EXECUTE QUERY
            // ========================================

            const {
                data,
                error
            } = await query

            if (error) {
                throw new Error(error.message)
            }

            res.json({
                success: true,
                data
            })

        } catch (error) {

            res.status(500).json({

                success: false,

                error: error.message

            })

        }

    }
// ============================================
// FILTER ORDERS
// ============================================

export const filterOrdersController =
    async (req, res) => {

        try {

            const {
                status
            } = req.query

            let query =
                supabase
                    .from('orders')
                    .select('*')

            // ========================================
            // STATUS FILTER
            // ========================================

            if (status) {

                query =
                    query.eq(
                        'status',
                        status
                    )

            }

            // ========================================
            // EXECUTE QUERY
            // ========================================

            const {
                data,
                error
            } = await query

            if (error) {
                throw new Error(error.message)
            }

            res.json({

                success: true,

                data

            })

        } catch (error) {

            res.status(500).json({

                success: false,

                error: error.message

            })

        }

    }
// ============================================
// PAGINATED PRODUCTS
// ============================================

export const paginatedProductsController =
    async (req, res) => {

        try {

            // ========================================
            // QUERY PARAMS
            // ========================================

            const page =
                parseInt(req.query.page) || 1

            const limit =
                parseInt(req.query.limit) || 10

            // ========================================
            // CALCULATE RANGE
            // ========================================

            const from =
                (page - 1) * limit

            const to =
                from + limit - 1

            // ========================================
            // FETCH PRODUCTS
            // ========================================

            const {
                data,
                error,
                count
            } = await supabase
                .from('products')
                .select('*', {
                    count: 'exact'
                })
                .range(from, to)

            // ========================================
            // HANDLE ERROR
            // ========================================

            if (error) {
                throw new Error(error.message)
            }

            // ========================================
            // RESPONSE
            // ========================================

            res.json({

                success: true,

                pagination: {

                    page,

                    limit,

                    total: count,

                    totalPages:
                        Math.ceil(count / limit)

                },

                data

            })

        } catch (error) {

            res.status(500).json({

                success: false,

                error: error.message

            })

        }

    }
// ============================================
// PAGINATED ORDERS
// ============================================

export const paginatedOrdersController =
    async (req, res) => {

        try {

            // ========================================
            // QUERY PARAMS
            // ========================================

            const page =
                parseInt(req.query.page) || 1

            const limit =
                parseInt(req.query.limit) || 10

            // ========================================
            // CALCULATE RANGE
            // ========================================

            const from =
                (page - 1) * limit

            const to =
                from + limit - 1

            // ========================================
            // FETCH ORDERS
            // ========================================

            const {
                data,
                error,
                count
            } = await supabase
                .from('orders')
                .select('*', {
                    count: 'exact'
                })
                .range(from, to)

            // ========================================
            // HANDLE ERROR
            // ========================================

            if (error) {
                throw new Error(error.message)
            }

            // ========================================
            // RESPONSE
            // ========================================

            res.json({

                success: true,

                pagination: {

                    page,

                    limit,

                    total: count,

                    totalPages:
                        Math.ceil(count / limit)

                },

                data

            })

        } catch (error) {

            res.status(500).json({

                success: false,

                error: error.message

            })

        }

    }