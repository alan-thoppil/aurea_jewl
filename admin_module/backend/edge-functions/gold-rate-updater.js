const supabase = require('../lib/supabase')

async function updateGoldRate(rate24k, rate22k) {

    const { data, error } = await supabase
        .from('gold_rates')
        .insert([{
            rate_24k: rate24k,
            rate_22k: rate22k,
            created_at: new Date()
        }])
        .select()

    if (error) {
        throw error
    }

    return data
}

async function getLatestGoldRate() {

    const { data, error } = await supabase
        .from('gold_rates')
        .select('*')
        .order('created_at', {
            ascending: false
        })
        .limit(1)

    if (error) {
        throw error
    }

    return data
}

module.exports = {
    updateGoldRate,
    getLatestGoldRate
}