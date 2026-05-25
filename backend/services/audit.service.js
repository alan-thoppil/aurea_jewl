import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

// ============================================
// CREATE AUDIT LOG SERVICE
// ============================================

export const createAuditLogService = async ({
    user_id,
    action,
    module,
    details
}) => {

    // ============================================
    // INSERT AUDIT LOG
    // ============================================

    const {
        data: auditLog,
        error: auditError
    } = await supabase
        .from('audit_logs')
        .insert([
            {
                user_id,
                action,
                module,
                details
            }
        ])
        .select()
        .single()

    // ============================================
    // HANDLE ERROR
    // ============================================

    if (auditError) {
        throw new AppError(auditError.message, 500)
    }

    // ============================================
    // RETURN AUDIT LOG
    // ============================================

    return auditLog

}