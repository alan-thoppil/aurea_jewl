import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

import { checkLowStockService }
    from './inventory-alert.service.js'

import {

    emitEventService,

    emitRoomEventService

} from './realtime.service.js'

import {

    rollbackOrderService

} from './transaction.service.js'

// ============================================
// CREATE ORDER SERVICE
// ============================================

export const createOrderService =
    async (orderData) => {

        let order = null

        try {

            // ==========================================
            // CREATE MAIN ORDER
            // ==========================================

            const {
                data: createdOrder,
                error: orderError
            } = await supabase
                .from('orders')
                .insert([
                    {
                        customer_id:
                            orderData.customer_id,

                        total_amount:
                            orderData.total_amount,

                        status: 'pending'
                    }
                ])
                .select()
                .single()

            // ==========================================
            // HANDLE ORDER ERROR
            // ==========================================

            if (orderError) {
                throw new AppError(orderError.message, 500)
            }

            order = createdOrder

            // ==========================================
            // PREPARE ORDER ITEMS
            // ==========================================

            const orderItems =
                orderData.items.map(item => ({

                    order_id:
                        order.id,

                    product_id:
                        item.product_id,

                    quantity:
                        item.quantity,

                    price:
                        item.price

                }))

            // ==========================================
            // INSERT ORDER ITEMS
            // ==========================================

            const {
                data: insertedItems,
                error: itemsError
            } = await supabase
                .from('order_items')
                .insert(orderItems)
                .select()

            // ==========================================
            // HANDLE ITEMS ERROR
            // ==========================================

            if (itemsError) {
                throw new AppError(itemsError.message, 500)
            }

            // ==========================================
            // UPDATE INVENTORY
            // ==========================================

            for (const item of orderData.items) {

                // ========================================
                // FETCH INVENTORY ITEM
                // ========================================

                const {
                    data: inventoryItem,
                    error: inventoryFetchError
                } = await supabase
                    .from('inventory')
                    .select('*')
                    .eq(
                        'product_id',
                        item.product_id
                    )
                    .single()

                // ========================================
                // HANDLE FETCH ERROR
                // ========================================

                if (inventoryFetchError) {
                    throw new AppError(inventoryFetchError.message, 500)
                }

                // ========================================
                // CHECK STOCK
                // ========================================

                if (inventoryItem.quantity < item.quantity) {
                    throw new AppError(
                        `Insufficient stock for product ${item.product_id}`,
                        400
                    )
                }

                // ========================================
                // CALCULATE NEW QUANTITY
                // ========================================

                const newQuantity =
                    inventoryItem.quantity
                    - item.quantity

                // ========================================
                // UPDATE INVENTORY
                // ========================================

                const {
                    error: inventoryUpdateError
                } = await supabase
                    .from('inventory')
                    .update({
                        quantity: newQuantity
                    })
                    .eq(
                        'product_id',
                        item.product_id
                    )

                // ========================================
                // HANDLE INVENTORY ERROR
                // ========================================

                if (inventoryUpdateError) {
                    throw new AppError(inventoryUpdateError.message, 500)
                }

                // ========================================
                // CHECK LOW STOCK
                // ========================================

                await checkLowStockService({

                    product_id:
                        item.product_id,

                    quantity:
                        newQuantity

                })

                // ========================================
                // CREATE STOCK MOVEMENT
                // ========================================

                const {
                    error: stockMovementError
                } = await supabase
                    .from('stock_movements')
                    .insert([
                        {
                            product_id:
                                item.product_id,

                            movement_type:
                                'OUT',

                            quantity:
                                item.quantity,

                            notes:
                                `Order created: ${order.id}`
                        }
                    ])

                // ========================================
                // HANDLE STOCK MOVEMENT ERROR
                // ========================================

                if (stockMovementError) {
                    throw new AppError(stockMovementError.message, 500)
                }

            }

            // ==========================================
            // EMIT GLOBAL EVENT
            // ==========================================

            emitEventService({

                event:
                    'new-order',

                data: {
                    order,
                    items: insertedItems
                }

            })

            // ==========================================
            // EMIT CUSTOMER ROOM EVENT
            // ==========================================

            emitRoomEventService({

                room:
                    `customer-${order.customer_id}`,

                event:
                    'order-created',

                data: {
                    order,
                    items: insertedItems
                }

            })

            // ==========================================
            // RETURN COMPLETE ORDER
            // ==========================================

            return {

                order,

                items:
                    insertedItems

            }

        } catch (error) {

            // ==========================================
            // ROLLBACK ORDER
            // ==========================================

            if (order?.id) {

                await rollbackOrderService({

                    order_id:
                        order.id

                })

            }

            // ==========================================
            // THROW ERROR
            // ==========================================

            throw error

        }

    }