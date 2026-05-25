import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

export async function reserveInventory(productId, quantity) {

    const { data: inventory, error: inventoryError } =
        await supabase
            .from('inventory')
            .select('*')
            .eq('product_id', productId)
            .single()

    if (inventoryError) {
        throw inventoryError
    }

    if (!inventory) {
        throw new AppError('Inventory not found', 404)
    }

    if (inventory.quantity < quantity) {
        throw new AppError('Insufficient stock', 400)
    }

    const newQuantity = inventory.quantity - quantity

    const { data, error } = await supabase
        .from('inventory')
        .update({
            quantity: newQuantity
        })
        .eq('product_id', productId)
        .select()

    if (error) {
        throw error
    }

    return data
}