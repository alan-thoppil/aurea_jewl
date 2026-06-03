import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

// ============================================
// UPDATE ORDER STATUS SERVICE
// ============================================

export const updateOrderStatusService = async ({
    order_id,
    status
}) => {

    // ============================================
    // UPDATE ORDER STATUS
    // ============================================

    const {
        data: updatedOrder,
        error: updateError
    } = await supabase
        .from('orders')
        .update({
            status
        })
        .eq('id', order_id)
        .select()
        .single()

    // ============================================
    // HANDLE ERROR
    // ============================================

    if (updateError) {
        throw new AppError(updateError.message, 500)
    }

    // ============================================
    // RETURN UPDATED ORDER
    // ============================================

    return updatedOrder

}