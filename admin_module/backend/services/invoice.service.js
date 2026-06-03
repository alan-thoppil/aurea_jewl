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
            amount: total_amount
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

                subtotal: gstData.taxable_amount,

                gst_percentage:
                    gstData.gst_percentage,

                gst_amount:
                    gstData.gst_amount,

                cgst:
                    gstData.cgst,

                sgst:
                    gstData.sgst,

                total_amount:
                    gstData.final_amount,

                invoice_status: 'generated'
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