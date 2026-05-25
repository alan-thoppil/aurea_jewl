// ============================================
// GST CALCULATION SERVICE
// ============================================

export const calculateGSTService = ({
    amount,
    gstPercentage = 3
}) => {

    // ============================================
    // GST CALCULATION
    // ============================================

    const gstAmount =
        (amount * gstPercentage) / 100

    // ============================================
    // CGST + SGST
    // ============================================

    const cgst = gstAmount / 2
    const sgst = gstAmount / 2

    // ============================================
    // FINAL TOTAL
    // ============================================

    const finalAmount =
        amount + gstAmount

    // ============================================
    // RETURN GST DATA
    // ============================================

    return {
        taxable_amount: amount,
        gst_percentage: gstPercentage,
        gst_amount: gstAmount,
        cgst,
        sgst,
        final_amount: finalAmount
    }

}