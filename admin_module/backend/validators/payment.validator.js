import { z } from 'zod'

// ============================================
// CREATE PAYMENT VALIDATION SCHEMA
// ============================================

export const createPaymentSchema = z.object({

    order_id: z
        .string()
        .uuid('Invalid order ID'),

    amount: z
        .number()
        .min(0, 'Invalid payment amount'),

    payment_method: z
        .string()
        .min(1, 'Payment method required')

})
