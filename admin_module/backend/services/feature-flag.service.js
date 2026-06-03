import { supabase }
    from '../config/supabase.js'

// ============================================
// CHECK FEATURE FLAG
// ============================================

export const isFeatureEnabled =
    async (featureKey) => {

        const {
            data,
            error
        } = await supabase

            .from('feature_flags')

            .select('*')

            .eq(
                'feature_key',
                featureKey
            )

            .single()

        // ==========================================
        // HANDLE ERROR
        // ==========================================

        if (error || !data) {

            return false

        }

        return data.enabled

    }