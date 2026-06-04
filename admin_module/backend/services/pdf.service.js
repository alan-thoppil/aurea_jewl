import PDFDocument from 'pdfkit'

import fs from 'fs'

import path from 'path'

// ============================================
// GENERATE INVOICE PDF SERVICE
// ============================================

export const generateInvoicePDFService =
    async (invoiceData) => {

        // ==========================================
        // CREATE PDF DOCUMENT
        // ==========================================

        const doc = new PDFDocument()

        // ==========================================
        // FILE NAME
        // ==========================================

        const fileName =
            `invoice-${invoiceData.invoice_number}.pdf`

        // ==========================================
        // FILE PATH
        // ==========================================

        const filePath =
            path.join('uploads', fileName)

        // ==========================================
        // WRITE STREAM
        // ==========================================

        doc.pipe(
            fs.createWriteStream(filePath)
        )

        // ==========================================
        // PDF CONTENT
        // ==========================================

        doc.fontSize(22)
            .text('AUREA JEWELS', {
                align: 'center'
            })

        doc.moveDown()

        doc.fontSize(16)
            .text(
                `Invoice Number: ${invoiceData.invoice_number}`
            )

        doc.text(
            `Order ID: ${invoiceData.order_id}`
        )

        doc.text(
            `Customer ID: ${invoiceData.customer_id}`
        )

        doc.moveDown()

        doc.text(
            `Subtotal: ₹${invoiceData.subtotal}`
        )

        doc.text(
            `GST: ₹${(Number(invoiceData.cgst_amount) + Number(invoiceData.sgst_amount)).toFixed(2)}`
        )

        doc.text(
            `CGST: ₹${invoiceData.cgst_amount}`
        )

        doc.text(
            `SGST: ₹${invoiceData.sgst_amount}`
        )

        doc.moveDown()

        doc.fontSize(18)
            .text(
                `Final Amount: ₹${invoiceData.total_amount}`
            )

        doc.moveDown()

        doc.text(
            'Thank you for shopping with AUREA.'
        )

        // ==========================================
        // FINALIZE PDF
        // ==========================================

        doc.end()

        // ==========================================
        // RETURN FILE DATA
        // ==========================================

        return {
            fileName,
            filePath
        }

    }