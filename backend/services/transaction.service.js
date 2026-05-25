import { supabase }
    from '../config/supabase.js'

// ============================================
// ROLLBACK ORDER SERVICE
// ============================================

export const rollbackOrderService =
    async ({
        order_id
    }) => {

        // ==========================================
        // DELETE ORDER ITEMS
        // ==========================================

        await supabase
            .from('order_items')
            .delete()
            .eq('order_id', order_id)

        // ==========================================
        // DELETE ORDER
        // ==========================================

        await supabase
            .from('orders')
            .delete()
            .eq('id', order_id)

    }