const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

function generateInvoice(order) {

    const doc = new PDFDocument()

    const invoicePath = path.join(
        __dirname,
        `invoice-${order.order_number}.pdf`
    )

    doc.pipe(fs.createWriteStream(invoicePath))

    doc.fontSize(20)
    doc.text('AUREA JEWELPRO', {
        align: 'center'
    })

    doc.moveDown()

    doc.fontSize(14)
    doc.text(`Invoice #: ${order.order_number}`)
    doc.text(`Customer: ${order.customer_name}`)
    doc.text(`Amount: ₹${order.amount}`)

    doc.moveDown()

    doc.text('Thank you for your purchase.')

    doc.end()

    return invoicePath
}

module.exports = {
    generateInvoice
}