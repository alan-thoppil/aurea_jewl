import {

    getSystemHealthService

} from '../services/monitoring.service.js'

// ============================================
// SYSTEM HEALTH CONTROLLER
// ============================================

export const getSystemHealthController =
    async (req, res) => {

        try {

            const result =
                await getSystemHealthService()

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