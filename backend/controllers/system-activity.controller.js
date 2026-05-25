import {

    getSystemActivitiesService

} from '../services/system-activity.service.js'

// ============================================
// GET SYSTEM ACTIVITIES
// ============================================

export const getSystemActivitiesController =
    async (req, res) => {

        try {

            const result =
                await getSystemActivitiesService()

            res.json({

                success: true,

                data: result

            })

        } catch (error) {

            res.status(500).json({

                success: false,

                error: error.message

            })

        }

    }