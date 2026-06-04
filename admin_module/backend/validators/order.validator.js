import { z } from 'zod'

// ============================================
// CREATE ORDER VALIDATION SCHEMA
// ============================================

export const createOrderSchema = z.object({

    customer_id: z
        .string()
        .uuid('Invalid customer ID')
        .optional(),

    customer_details: z
        .object({
            name: z.string().min(1, 'Name is required'),
            email: z.string().email('Invalid email format'),
            phone: z.string().optional(),
            birthday: z.string().optional()
        })
        .optional(),

    items: z
        .array(
            z.object({

                product_id: z
                    .string()
                    .uuid('Invalid product ID'),

                quantity: z
                    .number()
                    .min(1, 'Quantity must be at least 1'),

                price: z
                    .number()
                    .min(0, 'Price cannot be negative')

            })
        )
        .min(1, 'Order must contain at least one item'),

    total_amount: z
        .number()
        .min(0, 'Invalid total amount')

})