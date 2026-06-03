import {
    uploadFileService
} from '../services/file.service.js'

// ============================================
// UPLOAD FILE CONTROLLER
// ============================================

export const uploadFileController =
    async (req, res) => {

        try {

            const result =
                await uploadFileService({

                    bucket:
                        req.body.bucket,

                    file:
                        req.file

                })

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