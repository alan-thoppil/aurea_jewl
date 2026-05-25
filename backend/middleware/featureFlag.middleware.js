import {

    isFeatureEnabled

} from '../services/feature-flag.service.js'

// ============================================
// FEATURE FLAG MIDDLEWARE
// ============================================

export const featureFlag =
    (featureKey) => {

        return async (
            req,
            res,
            next
        ) => {

            const enabled =
                await isFeatureEnabled(
                    featureKey
                )

            // ========================================
            // FEATURE DISABLED
            // ========================================

            if (!enabled) {

                return res.status(503).json({

                    success: false,

                    message:
                        `Feature disabled: ${featureKey}`

                })

            }

            next()

        }

    }