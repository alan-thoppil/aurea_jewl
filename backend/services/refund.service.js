import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

import { createAuditLogService }
    from './audit.service.js'

import { createNotificationService }
    from './notification.service.js'

// ============================================
// CREATE REFUND SERVICE
// ============================================

export const createRefundService = async ({
    payment_id,
    amount
}) => {

    // ============================================
    // FETCH PAYMENT
    // ============================================

    const {
        data: payment,
        error: paymentError
    } = await supabase
        .from('payments')
        .select('*')
        .eq('id', payment_id)
        .single()

    if (paymentError) {
        throw new AppError(paymentError.message, 500)
    }

    // ============================================
    // CREATE REFUND RECORD
    // ============================================

    const {
        data: refund,
        error: refundError
    } = await supabase
        .from('refunds')
        .insert([
            {
                payment_id,
                amount,
                refund_status: 'processed'
            }
        ])
        .select()
        .single()

    if (refundError) {
        throw new AppError(refundError.message, 500)
    }

    // ============================================
    // UPDATE PAYMENT STATUS
    // ============================================

    const {
        error: updateError
    } = await supabase
        .from('payments')
        .update({
            payment_status: 'refunded'
        })
        .eq('id', payment_id)

    if (updateError) {
        throw new AppError(updateError.message, 500)
    }

    // ============================================
    // CREATE ACCOUNTING REVERSAL
    // ============================================

    const getOrCreateAccount = async (name, type, code) => {
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
    };

    const cashAccountId = await getOrCreateAccount('Cash', 'asset', '1000');
    const salesReturnsAccountId = await getOrCreateAccount('Sales Returns', 'expense', '5000');

    const entryNumber = `JE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const description = `Refund processed for payment ${payment_id}`;

    const { data: journalEntry, error: journalError } = await supabase
        .from('journal_entries')
        .insert([
            {
                entry_number: entryNumber,
                type: 'refund',
                reference_type: 'payments',
                reference_id: payment_id,
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

    const { error: ledgerError } = await supabase
        .from('ledger_entries')
        .insert([
            {
                journal_entry_id: journalEntry.id,
                account_id: salesReturnsAccountId,
                type: 'debit',
                amount,
                narration: description
            },
            {
                journal_entry_id: journalEntry.id,
                account_id: cashAccountId,
                type: 'credit',
                amount,
                narration: description
            }
        ]);

    if (ledgerError) {
        throw new AppError(`Ledger Line Error: ${ledgerError.message}`, 500);
    }


    // ============================================
    // RESOLVE USER ID FOR AUDIT LOG & NOTIFICATION
    // ============================================

    const { data: order } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', payment.order_id)
        .single();

    let targetUserId = order ? order.user_id : null;
    if (!targetUserId) {
        const { data: users } = await supabase
            .from('users')
            .select('id')
            .limit(1);
        if (users && users.length > 0) {
            targetUserId = users[0].id;
        }
    }

    // ============================================
    // CREATE AUDIT LOG
    // ============================================

    const auditLog =
        await createAuditLogService({

            user_id:
                targetUserId,

            action:
                'REFUND_PROCESSED',

            module:
                'REFUNDS',

            details:
                `Refund processed for payment ${payment_id}`

        })

    // ============================================
    // CREATE NOTIFICATION
    // ============================================

    const notification =
        await createNotificationService({

            user_id:
                targetUserId,

            title:
                'Refund Processed',

            message:
                `Refund has been processed for payment ${payment_id}`,

            notification_type:
                'REFUND'

        })

    // ============================================
    // RETURN RESPONSE
    // ============================================

    return {
        refund,
        auditLog,
        notification
    }

}