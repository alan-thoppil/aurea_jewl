import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

// ============================================
// ADJUST INVENTORY
// ============================================

export const adjustInventoryService =
    async ({

        product_id,

        quantity,

        movement_type,

        notes = '',

        created_by = null

    }) => {

        // ==========================================
        // GET CURRENT INVENTORY
        // ==========================================

        const {

            data: inventory,

            error: inventoryError

        } = await supabase

            .from('inventory')

            .select('*')

            .eq(
                'product_id',
                product_id
            )

            .single()

        // ==========================================
        // HANDLE ERROR
        // ==========================================

        if (inventoryError) {

            throw new AppError(
                inventoryError.message,
                500
            )

        }

        // ==========================================
        // CALCULATE NEW QUANTITY
        // ==========================================

        const newQuantity =

            inventory.quantity
            + quantity

        // ==========================================
        // PREVENT NEGATIVE STOCK
        // ==========================================

        if (newQuantity < 0) {

            throw new AppError(
                'Insufficient stock',
                400
            )

        }

        // ==========================================
        // UPDATE INVENTORY
        // ==========================================

        const {

            data: updatedInventory,

            error: updateError

        } = await supabase

            .from('inventory')

            .update({

                quantity:
                    newQuantity

            })

            .eq(
                'product_id',
                product_id
            )

            .select()

            .single()

        // ==========================================
        // HANDLE UPDATE ERROR
        // ==========================================

        if (updateError) {

            throw new AppError(
                updateError.message,
                500
            )

        }

        // ==========================================
        // CREATE MOVEMENT LOG
        // ==========================================

        await supabase

            .from(
                'inventory_movements'
            )

            .insert([

                {

                    product_id,

                    movement_type,

                    quantity,

                    notes,

                    created_by

                }

            ])

        // ==========================================
        // RETURN RESULT
        // ==========================================

        return updatedInventory

    }

// ============================================
// GET INVENTORY MOVEMENTS
// ============================================

export const getInventoryMovementsService =
    async () => {

        const {
            data,
            error
        } = await supabase

            .from(
                'inventory_movements'
            )

            .select('*')

            .order(
                'created_at',
                { ascending: false }
            )

        if (error) {

            throw new AppError(
                error.message,
                500
            )

        }

        return data

    }