import Razorpay from 'razorpay'

// ============================================
// RAZORPAY INSTANCE
// ============================================

export const razorpay = new Razorpay({

    key_id:
        process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykeyid',

    key_secret:
        process.env.RAZORPAY_KEY_SECRET || 'dummysuprisekeysecret'

})