import { supabase }
    from '../config/supabase.js'

import AppError
    from '../utils/AppError.js'

import {
    generateInvoiceService
} from './invoice.service.js'

import {
    createLedgerEntryService
} from './accounting.service.js'

import {
    createAuditLogService
} from './audit.service.js'

import {
    createNotificationService
} from './notification.service.js'

import {
    createSystemActivityService
} from './system-activity.service.js'

import {
    emailQueue
} from '../queues/email.queue.js'

// ============================================
// CREATE PAYMENT SERVICE
// ============================================

export const createPaymentService =
    async (paymentData) => {

        // ==========================================
        // INSERT PAYMENT
        // ==========================================

        const {
            data: payment,
            error: paymentError
        } = await supabase
            .from('payments')
            .insert([
                {
                    order_id:
                        paymentData.order_id,

                    amount:
                        paymentData.amount,

                    payment_method:
                        paymentData.payment_method,

                    payment_status:
                        'paid'
                }
            ])
            .select()
            .single()

        // ==========================================
        // HANDLE PAYMENT ERROR
        // ==========================================

        if (paymentError) {

            throw new AppError(
                paymentError.message,
                500
            )

        }

        // ==========================================
        // UPDATE ORDER STATUS
        // ==========================================

        const {
            data: updatedOrder,
            error: orderUpdateError
        } = await supabase
            .from('orders')
            .update({

                payment_status:
                    'paid',

                status:
                    'confirmed'

            })
            .eq(
                'id',
                paymentData.order_id
            )
            .select()
            .single()

        // ==========================================
        // HANDLE ORDER UPDATE ERROR
        // ==========================================

        if (orderUpdateError) {

            throw new AppError(
                orderUpdateError.message,
                500
            )

        }

        // ==========================================
        // GENERATE INVOICE
        // ==========================================

        const invoice =
            await generateInvoiceService({

                order_id:
                    updatedOrder.id,

                customer_id:
                    updatedOrder.customer_id,

                total_amount:
                    updatedOrder.total_amount

            })

        // ==========================================
        // CREATE LEDGER ENTRY
        // ==========================================

        const ledgerEntry =
            await createLedgerEntryService({

                order_id:
                    updatedOrder.id,

                payment_id:
                    payment.id,

                amount:
                    payment.amount

            })

        // ==========================================
        // CREATE AUDIT LOG
        // ==========================================

        const auditLog =
            await createAuditLogService({

                user_id:
                    updatedOrder.customer_id,

                action:
                    'PAYMENT_COMPLETED',

                module:
                    'PAYMENTS',

                details:
                    `Payment completed for order ${updatedOrder.id}`

            })

        // ==========================================
        // CREATE NOTIFICATION
        // ==========================================

        const notification =
            await createNotificationService({

                user_id:
                    updatedOrder.customer_id,

                title:
                    'Payment Successful',

                message:
                    `Your payment for order ${updatedOrder.id} was successful.`,

                notification_type:
                    'PAYMENT'

            })

        // ==========================================
        // ADD EMAIL TO QUEUE
        // ==========================================

        await emailQueue.add(

            'payment-email',

            {

                to:
                    'customer@example.com',

                subject:
                    'Payment Successful - AUREA',

                html: `

                    <h1>
                        Payment Successful
                    </h1>

                    <p>
                        Your payment for order
                        ${updatedOrder.id}
                        was successful.
                    </p>

                    <p>
                        Invoice Number:
                        ${invoice.invoice_number}
                    </p>

                `

            }

        )

        // ==========================================
        // CREATE SYSTEM ACTIVITY
        // ==========================================

        await createSystemActivityService({

            user_id:
                updatedOrder.customer_id,

            action:
                'PAYMENT_COMPLETED',

            module:
                'PAYMENTS',

            details:
                `Payment completed for order ${updatedOrder.id}`,

            metadata: {

                order_id:
                    updatedOrder.id,

                payment_id:
                    payment.id

            }

        })

        // ==========================================
        // RETURN COMPLETE RESPONSE
        // ==========================================

        return {

            payment,

            invoice,

            ledgerEntry,

            auditLog,

            notification

        }

    }