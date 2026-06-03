const supabase = require('../lib/supabase')

async function getLowStockProducts(limit = 5) {

    const { data, error } = await supabase
        .from('inventory')
        .select(`
      *,
      products(*)
    `)
        .lte('quantity', limit)

    if (error) {
        throw error
    }

    return data
}

module.exports = {
    getLowStockProducts
}