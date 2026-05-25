import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

// ============================================
// CREATE NOTIFICATION SERVICE
// ============================================

export const createNotificationService = async ({
    user_id,
    title,
    message,
    notification_type = 'SYSTEM'
}) => {

    // ============================================
    // INSERT NOTIFICATION
    // ============================================

    const {
        data: notification,
        error: notificationError
    } = await supabase
        .from('notifications')
        .insert([
            {
                user_id,
                title,
                message,
                notification_type,
                is_read: false
            }
        ])
        .select()
        .single()

    // ============================================
    // HANDLE ERROR
    // ============================================

    if (notificationError) {
        throw new AppError(notificationError.message, 500)
    }

    // ============================================
    // RETURN NOTIFICATION
    // ============================================

    return notification

}