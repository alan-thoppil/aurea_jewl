import {

    adjustInventoryService,

    getInventoryMovementsService

} from '../services/inventory.service.js'

// ============================================
// ADJUST INVENTORY
// ============================================

export const adjustInventoryController =
    async (req, res) => {

        try {

            const result =

                await adjustInventoryService(
                    req.body
                )

            res.json({

                success: true,

                data: result

            })

        } catch (error) {

            res.status(500).json({

                success: false,

                error:
                    error.message

            })

        }

    }

// ============================================
// GET INVENTORY MOVEMENTS
// ============================================

export const getInventoryMovementsController =
    async (req, res) => {

        try {

            const result =

                await getInventoryMovementsService()

            res.json({

                success: true,

                data: result

            })

        } catch (error) {

            res.status(500).json({

                success: false,

                error:
                    error.message

            })

        }

    }