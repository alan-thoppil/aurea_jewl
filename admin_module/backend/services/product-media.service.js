import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

// ============================================
// ATTACH MEDIA TO PRODUCT
// ============================================

export const attachMediaToProductService =
    async ({

        product_id,

        media_id,

        is_primary = false,

        sort_order = 0

    }) => {

        const {
            data,
            error
        } = await supabase

            .from('product_media')

            .insert([

                {

                    product_id,

                    media_id,

                    is_primary,

                    sort_order

                }

            ])

            .select()

            .single()

        // ==========================================
        // HANDLE ERROR
        // ==========================================

        if (error) {

            throw new AppError(
                error.message,
                500
            )

        }

        return data

    }

// ============================================
// GET PRODUCT MEDIA
// ============================================

export const getProductMediaService =
    async (product_id) => {

        const {
            data,
            error
        } = await supabase

            .from('product_media')

            .select('*')

            .eq(
                'product_id',
                product_id
            )

            .order(
                'sort_order',
                { ascending: true }
            )

        // ==========================================
        // HANDLE ERROR
        // ==========================================

        if (error) {

            throw new AppError(
                error.message,
                500
            )

        }

        return data

    }