import multer
    from 'multer'

import path
    from 'path'

// ============================================
// STORAGE CONFIG
// ============================================

const storage =
    multer.diskStorage({

        destination:
            (req, file, cb) => {

                cb(
                    null,
                    'uploads/'
                )

            },

        filename:
            (req, file, cb) => {

                const uniqueName =

                    Date.now()
                    + '-'
                    + Math.round(
                        Math.random() * 1e9
                    )

                    + path.extname(
                        file.originalname
                    )

                cb(
                    null,
                    uniqueName
                )

            }

    })

// ============================================
// FILE FILTER
// ============================================

const fileFilter =
    (req, file, cb) => {

        // ==========================================
        // ALLOWED TYPES
        // ==========================================

        const allowedTypes = [

            'image/jpeg',

            'image/png',

            'image/webp'

        ]

        // ==========================================
        // VALIDATE TYPE
        // ==========================================

        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(null, true)

        } else {

            cb(

                new Error(
                    'Invalid file type'
                ),

                false

            )

        }

    }

// ============================================
// MULTER INSTANCE
// ============================================

export const upload =
    multer({

        storage,

        fileFilter,

        limits: {

            fileSize:
                5 * 1024 * 1024

        }

    })