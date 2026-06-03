import sharp
    from 'sharp'

import path
    from 'path'

// ============================================
// GENERATE THUMBNAIL
// ============================================

export const generateThumbnailService =
    async (filePath) => {

        // ==========================================
        // FILE NAME
        // ==========================================

        const fileName =
            path.basename(filePath)

        // ==========================================
        // THUMBNAIL PATH
        // ==========================================

        const thumbnailPath =

            `uploads/thumbnails/${fileName}`

        // ==========================================
        // GENERATE THUMBNAIL
        // ==========================================

        await sharp(filePath)

            .resize({

                width: 300

            })

            .jpeg({

                quality: 80

            })

            .toFile(thumbnailPath)

        // ==========================================
        // RETURN PATH
        // ==========================================

        return thumbnailPath

    }