import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

// ============================================
// SAVE MEDIA FILE
// ============================================

export const saveMediaFileService =
    async ({

        file_name,

        original_name,

        mime_type,

        file_size,

        file_path,

        thumbnail_path = null,

        uploaded_by = null

    }) => {

        const {

            data,

            error

        } = await supabase

            .from('media_files')

            .insert([

                {

                    file_name,

                    original_name,

                    mime_type,

                    file_size,

                    file_path,

                    thumbnail_path,

                    uploaded_by

                }

            ])

            .select()

            .single()

        // ========================================
        // HANDLE ERROR
        // ========================================

        if (error) {

            throw new AppError(
                error.message,
                500
            )

        }

        return data

    }