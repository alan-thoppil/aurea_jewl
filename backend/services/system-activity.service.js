import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

// ============================================
// CREATE SYSTEM ACTIVITY
// ============================================

export const createSystemActivityService =
    async ({

        user_id,

        action,

        module,

        details,

        metadata = {}

    }) => {

        const {
            data,
            error
        } = await supabase

            .from('system_activities')

            .insert([

                {

                    user_id,

                    action,

                    module,

                    details,

                    metadata

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
// GET SYSTEM ACTIVITIES
// ============================================

export const getSystemActivitiesService =
    async () => {

        const {
            data,
            error
        } = await supabase

            .from('system_activities')

            .select('*')

            .order(
                'created_at',
                { ascending: false }
            )

            .limit(100)

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