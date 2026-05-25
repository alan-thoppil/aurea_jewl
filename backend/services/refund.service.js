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

    await supabase
        .from('ledger_entries')
        .insert([
            {
                order_id: payment.order_id,
                payment_id: payment.id,

                transaction_type: 'REFUND',

                debit_account: 'Sales Returns',

                credit_account: 'Cash',

                amount,

                notes:
                    `Refund processed for payment ${payment_id}`
            }
        ])

    // ============================================
    // CREATE AUDIT LOG
    // ============================================

    const auditLog =
        await createAuditLogService({

            user_id:
                null,

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
                null,

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