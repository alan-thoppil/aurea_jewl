import {

    getDashboardAnalyticsService

} from '../services/analytics.service.js'

import {

    successResponse,

    errorResponse

} from '../utils/apiResponse.js'

// ============================================
// ADMIN DASHBOARD CONTROLLER
// ============================================

export const getDashboardController =
    async (req, res) => {

        try {

            const analytics =
                await getDashboardAnalyticsService()

            successResponse(res, {

                message:
                    'Dashboard data fetched successfully',

                data:
                    analytics

            })

        } catch (error) {

            errorResponse(res, {

                message:
                    'Failed to fetch dashboard data',

                error:
                    error.message

            })

        }

    }
