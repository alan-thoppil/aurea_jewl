import {

    getDashboardAnalyticsService

} from '../services/analytics.service.js'

import {

    successResponse,

    errorResponse

} from '../utils/apiResponse.js'

// ============================================
// GET DASHBOARD ANALYTICS
// ============================================

export const getDashboardAnalyticsController =
    async (req, res) => {

        try {

            const result =
                await getDashboardAnalyticsService()

            return successResponse(res, {

                message:
                    'Dashboard analytics fetched',

                data: result

            })

        } catch (error) {

            return errorResponse(res, {

                message:
                    'Failed to fetch analytics',

                error: error.message

            })

        }

    }