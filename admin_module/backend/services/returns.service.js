import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

import { createAuditLogService }
    from './audit.service.js'

import { createNotificationService }
    from './notification.service.js'

// ============================================
// CANCEL ORDER SERVICE
// ============================================

export const cancelOrderService = async (
    order_id
) => {

    // ============================================
    // FETCH ORDER ITEMS
    // ============================================

    const {
        data: orderItems,
        error: itemsError
    } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order_id)

    // ============================================
    // HANDLE ERROR
    // ============================================

    if (itemsError) {
        throw new AppError(itemsError.message, 500)
    }

    // ============================================
    // RESTORE INVENTORY
    // ============================================

    for (const item of orderItems) {

        // ==========================================
        // FETCH INVENTORY
        // ==========================================

        const {
            data: inventoryItem,
            error: inventoryError
        } = await supabase
            .from('inventory')
            .select('*')
            .eq('product_id', item.product_id)
            .single()

        if (inventoryError) {
            throw new AppError(inventoryError.message, 500)
        }

        // ==========================================
        // RESTORE QUANTITY
        // ==========================================

        const restoredQuantity =
            inventoryItem.quantity + item.quantity

        // ==========================================
        // UPDATE INVENTORY
        // ==========================================

        const {
            error: updateError
        } = await supabase
            .from('inventory')
            .update({
                quantity: restoredQuantity
            })
            .eq('product_id', item.product_id)

        if (updateError) {
            throw new AppError(updateError.message, 500)
        }

        // ==========================================
        // STOCK MOVEMENT
        // ==========================================

        await supabase
            .from('stock_movements')
            .insert([
                {
                    product_id: item.product_id,
                    type: 'return',
                    quantity_change: item.quantity,
                    quantity_before: inventoryItem.quantity,
                    quantity_after: restoredQuantity,
                    reference_type: 'orders',
                    reference_id: order_id,
                    notes:
                        `Order cancelled: ${order_id}`
                }
            ])

    }

    // ============================================
    // UPDATE ORDER STATUS
    // ============================================

    const {
        data: updatedOrder,
        error: orderError
    } = await supabase
        .from('orders')
        .update({
            order_status: 'cancelled'
        })
        .eq('id', order_id)
        .select()
        .single()

    if (orderError) {
        throw new AppError(orderError.message, 500)
    }

    // ============================================
    // CREATE AUDIT LOG
    // ============================================

    const auditLog =
        await createAuditLogService({

            user_id:
                updatedOrder.user_id,

            action:
                'ORDER_CANCELLED',

            module:
                'ORDERS',

            details:
                `Order ${order_id} cancelled`

        })

    // ============================================
    // CREATE NOTIFICATION
    // ============================================

    const notification =
        await createNotificationService({

            user_id:
                updatedOrder.user_id,

            title:
                'Order Cancelled',

            message:
                `Your order ${order_id} was cancelled.`,

            notification_type:
                'ORDER'

        })

    // ============================================
    // RETURN RESPONSE
    // ============================================

    return {
        order: updatedOrder,
        auditLog,
        notification
    }

}