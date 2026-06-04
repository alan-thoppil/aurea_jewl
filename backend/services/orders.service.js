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
            // FIND OR CREATE USER & CUSTOMER (BULLETPROOF)
            // ==========================================
            const { name, email, phone, birthday } = orderData.customer_details || {};
            
            if (!email) {
                throw new AppError('Customer email is required for checkout', 400);
            }

            // 1. Check if customer profile already exists by email
            const { data: customer, error: customerFetchError } = await supabase
                .from('customers')
                .select('id')
                .eq('email', email)
                .maybeSingle();

            if (customerFetchError) {
                throw new AppError(customerFetchError.message, 500);
            }

            let customerId;
            if (customer) {
                customerId = customer.id;

                // Make sure a user record exists with this ID to satisfy the foreign key constraint
                const { data: user, error: userFetchError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('id', customerId)
                    .maybeSingle();

                if (userFetchError) {
                    throw new AppError(userFetchError.message, 500);
                }

                if (!user) {
                    const nameParts = (name || 'Guest').trim().split(/\s+/);
                    const firstName = nameParts[0] || 'Guest';
                    const lastName = nameParts.slice(1).join(' ') || '';
                    const fullName = `${firstName} ${lastName}`.trim();

                    const { error: userInsertError } = await supabase
                        .from('users')
                        .insert({
                            id: customerId,
                            full_name: fullName,
                            email: email,
                            password_hash: 'guest_checkout_placeholder',
                            phone: phone || '+91 99999 99999',
                            role: 'customer'
                        });

                    if (userInsertError) {
                        throw new AppError(userInsertError.message, 500);
                    }
                }
            } else {
                // Customer profile does not exist. Check if user exists by email.
                const { data: existingUser, error: userFetchError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle();

                if (userFetchError) {
                    throw new AppError(userFetchError.message, 500);
                }

                if (existingUser) {
                    customerId = existingUser.id;
                } else {
                    // Create new user record first
                    const nameParts = (name || 'Guest').trim().split(/\s+/);
                    const firstName = nameParts[0] || 'Guest';
                    const lastName = nameParts.slice(1).join(' ') || '';
                    const fullName = `${firstName} ${lastName}`.trim();

                    const { data: newUser, error: userInsertError } = await supabase
                        .from('users')
                        .insert({
                            full_name: fullName,
                            email: email,
                            password_hash: 'guest_checkout_placeholder',
                            phone: phone || '+91 99999 99999',
                            role: 'customer'
                        })
                        .select()
                        .single();

                    if (userInsertError) {
                        throw new AppError(userInsertError.message, 500);
                    }
                    customerId = newUser.id;
                }

                // Create customer profile with the same ID
                const nameParts = (name || 'Guest').trim().split(/\s+/);
                const firstName = nameParts[0] || 'Guest';
                const lastName = nameParts.slice(1).join(' ') || '';

                const { error: customerInsertError } = await supabase
                    .from('customers')
                    .insert({
                        id: customerId,
                        first_name: firstName,
                        last_name: lastName,
                        email: email,
                        phone: phone || '+91 99999 99999',
                        date_of_birth: birthday || null
                    });

                if (customerInsertError) {
                    throw new AppError(customerInsertError.message, 500);
                }
            }

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
                        user_id:
                            customerId,

                        total_amount:
                            orderData.total_amount,

                        order_status: 'pending',
                        
                        payment_status: 'pending'
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

                            type:
                                'sale',

                            quantity_change:
                                -item.quantity,

                            quantity_before:
                                inventoryItem.quantity,

                            quantity_after:
                                newQuantity,

                            reference_type:
                                'orders',

                            reference_id:
                                order.id,

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
                    `customer-${order.user_id}`,

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