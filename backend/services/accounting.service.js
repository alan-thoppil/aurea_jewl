import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

async function getOrCreateAccount(name, type, code) {
    const { data: existing } = await supabase
        .from('ledger_accounts')
        .select('id')
        .eq('name', name)
        .limit(1);

    if (existing && existing.length > 0) {
        return existing[0].id;
    }

    const { data: created, error } = await supabase
        .from('ledger_accounts')
        .insert([
            {
                name,
                type,
                code,
                is_system_account: true
            }
        ])
        .select('id')
        .single();

    if (error) {
        throw new AppError(`Failed to create ledger account ${name}: ${error.message}`, 500);
    }
    return created.id;
}

// ============================================
// CREATE LEDGER ENTRY SERVICE
// ============================================

export const createLedgerEntryService = async ({
    order_id,
    payment_id,
    amount
}) => {

    try {
        // 1. Resolve Accounts
        const cashAccountId = await getOrCreateAccount('Cash', 'asset', '1000');
        const salesRevenueAccountId = await getOrCreateAccount('Sales Revenue', 'revenue', '4000');

        // 2. Create Journal Entry
        const entryNumber = `JE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const description = `Payment received for order ${order_id}`;

        const { data: journalEntry, error: journalError } = await supabase
            .from('journal_entries')
            .insert([
                {
                    entry_number: entryNumber,
                    type: 'sale',
                    reference_type: 'orders',
                    reference_id: order_id,
                    description,
                    total_debit: amount,
                    total_credit: amount,
                    is_posted: true
                }
            ])
            .select()
            .single();

        if (journalError) {
            throw new AppError(`Journal Entry Error: ${journalError.message}`, 500);
        }

        // 3. Create Debit and Credit Ledger Entries
        const { error: ledgerError } = await supabase
            .from('ledger_entries')
            .insert([
                {
                    journal_entry_id: journalEntry.id,
                    account_id: cashAccountId,
                    type: 'debit',
                    amount,
                    narration: description
                },
                {
                    journal_entry_id: journalEntry.id,
                    account_id: salesRevenueAccountId,
                    type: 'credit',
                    amount,
                    narration: description
                }
            ]);

        if (ledgerError) {
            throw new AppError(`Ledger Line Error: ${ledgerError.message}`, 500);
        }

        return journalEntry;
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(err.message, 500);
    }

}