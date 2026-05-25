import { supabase } from '../config/supabase.js'

import { createNotificationService }
    from './notification.service.js'

// ============================================
// LOW STOCK ALERT SERVICE
// ============================================

export const checkLowStockService = async ({
    product_id,
    quantity
}) => {

    // ============================================
    // LOW STOCK THRESHOLD
    // ============================================

    const LOW_STOCK_LIMIT = 5

    // ============================================
    // CHECK LOW STOCK
    // ============================================

    if (quantity <= LOW_STOCK_LIMIT) {

        // ==========================================
        // CREATE ADMIN NOTIFICATION
        // ==========================================

        const notification =
            await createNotificationService({

                user_id:
                    null,

                title:
                    'Low Stock Alert',

                message:
                    `Product ${product_id} is running low on stock. Remaining quantity: ${quantity}`,

                notification_type:
                    'INVENTORY'

            })

        return notification

    }

    return null

}