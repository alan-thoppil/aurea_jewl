import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

// ============================================
// GET ALL CATEGORIES
// ============================================

export const getAllCategoriesService =
    async () => {

        const {
            data,
            error
        } = await supabase

            .from('categories')

            .select('*')

            .order(
                'name',
                { ascending: true }
            )

        if (error) {

            throw new AppError(
                error.message,
                500
            )

        }

        return data

    }

// ============================================
// CREATE CATEGORY
// ============================================

export const createCategoryService =
    async (categoryData) => {

        const {
            data,
            error
        } = await supabase

            .from('categories')

            .insert([

                categoryData

            ])

            .select()

            .single()

        if (error) {

            throw new AppError(
                error.message,
                500
            )

        }

        return data

    }