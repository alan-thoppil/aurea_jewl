import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

// ============================================
// UPLOAD FILE SERVICE
// ============================================

export const uploadFileService = async ({
    bucket,
    file
}) => {

    // ============================================
    // GENERATE FILE NAME
    // ============================================

    const fileName =
        `${Date.now()}-${file.originalname}`

    // ============================================
    // UPLOAD TO SUPABASE STORAGE
    // ============================================

    const {
        error
    } = await supabase
        .storage
        .from(bucket)
        .upload(fileName, file.buffer, {

            contentType:
                file.mimetype

        })

    // ============================================
    // HANDLE ERROR
    // ============================================

    if (error) {
        throw new AppError(error.message, 500)
    }

    // ============================================
    // GET PUBLIC URL
    // ============================================

    const {
        data
    } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(fileName)

    // ============================================
    // RETURN FILE DATA
    // ============================================

    return {
        fileName,
        url: data.publicUrl
    }

}