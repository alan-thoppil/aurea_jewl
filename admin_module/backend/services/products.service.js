import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

// ============================================
// GET ALL PRODUCTS SERVICE
// ============================================
export const getAllProductsService = async () => {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories(*),
            product_images(*),
            product_variants(*)
        `)

    if (error) {
        throw new AppError(error.message, 500)
    }

    return data
}

// ============================================
// GET PRODUCT BY ID SERVICE
// ============================================
export const getProductByIdService = async (id) => {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories(*),
            product_images(*),
            product_variants(*)
        `)
        .eq('id', id)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            throw new AppError('Product not found', 404)
        }
        throw new AppError(error.message, 500)
    }

    return data
}

// ============================================
// CREATE PRODUCT SERVICE
// ============================================
export const createProductService = async (productData) => {
    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

    if (error) {
        throw new AppError(error.message, 400)
    }

    return data
}

// ============================================
// UPDATE PRODUCT SERVICE
// ============================================
export const updateProductService = async (id, productData) => {
    const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new AppError(error.message, 400)
    }

    return data
}

// ============================================
// DELETE PRODUCT SERVICE
// ============================================
export const deleteProductService = async (id) => {
    const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new AppError(error.message, 400)
    }

    return data
}

// ============================================
// SEARCH PRODUCTS SERVICE
// ============================================
export const searchProductsService = async ({
    search = '',
    minPrice = 0,
    maxPrice = 999999999,
    sortBy = 'created_at',
    order = 'desc',
    page = 1,
    limit = 10
}) => {
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .gte('price', minPrice)
        .lte('price', maxPrice)
        .range(from, to)
        .order(sortBy, { ascending: order === 'asc' })

    if (search) {
        query = query.ilike('name', `%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
        throw new AppError(error.message, 500)
    }

    return {
        products: data,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
    }
}