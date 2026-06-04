import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

import { calculateGSTService }
    from './gst.service.js'
import { generateInvoicePDFService }
    from './pdf.service.js'
// ============================================
// GENERATE INVOICE SERVICE
// ============================================

export const generateInvoiceService = async ({
    order_id,
    customer_id,
    total_amount
}) => {

    // ============================================
    // CALCULATE GST
    // ============================================

    const gstData =
        calculateGSTService({
            amount: total_amount / 1.03
        })

    // ============================================
    // GENERATE INVOICE NUMBER
    // ============================================

    const invoiceNumber =
        `INV-${Date.now()}`

    // ============================================
    // INSERT INVOICE
    // ============================================

    const {
        data: invoice,
        error: invoiceError
    } = await supabase
        .from('invoices')
        .insert([
            {
                order_id,
                customer_id,
                invoice_number: invoiceNumber,

                subtotal: parseFloat(gstData.taxable_amount.toFixed(2)),
                taxable_amount: parseFloat(gstData.taxable_amount.toFixed(2)),

                cgst_rate: 1.50,
                sgst_rate: 1.50,

                cgst_amount: parseFloat(gstData.cgst.toFixed(2)),
                sgst_amount: parseFloat(gstData.sgst.toFixed(2)),

                total_amount: parseFloat(gstData.final_amount.toFixed(2)),

                status: 'generated'
            }
        ])
        .select()
        .single()

    // ============================================
    // HANDLE ERROR
    // ============================================

    if (invoiceError) {
        throw new AppError(invoiceError.message, 500)
    }
    // ============================================
    // GENERATE PDF
    // ============================================

    const pdfData =
        await generateInvoicePDFService(
            invoice
        )
    // ============================================
    // RETURN INVOICE
    // ============================================

    return {
        ...invoice,
        pdf: pdfData
    }

}