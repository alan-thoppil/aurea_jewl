import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

// ============================================
// CREATE LEDGER ENTRY SERVICE
// ============================================

export const createLedgerEntryService = async ({
    order_id,
    payment_id,
    amount
}) => {

    // ============================================
    // INSERT ACCOUNTING ENTRY
    // ============================================

    const {
        data: ledgerEntry,
        error: ledgerError
    } = await supabase
        .from('ledger_entries')
        .insert([
            {
                order_id,
                payment_id,

                transaction_type: 'SALE',

                debit_account: 'Cash',

                credit_account: 'Sales Revenue',

                amount,

                notes: `Payment received for order ${order_id}`
            }
        ])
        .select()
        .single()

    // ============================================
    // HANDLE ERROR
    // ============================================

    if (ledgerError) {
        throw new AppError(ledgerError.message, 500)
    }

    // ============================================
    // RETURN LEDGER ENTRY
    // ============================================

    return ledgerEntry

}