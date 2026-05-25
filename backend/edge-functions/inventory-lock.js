const supabase = require('../lib/supabase')

async function reserveInventory(productId, quantity) {

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
        throw new Error('Inventory not found')
    }

    if (inventory.quantity < quantity) {
        throw new Error('Insufficient stock')
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

module.exports = {
    reserveInventory
}