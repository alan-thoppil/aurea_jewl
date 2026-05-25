// ============================================
// GLOBAL ERROR HANDLER
// ============================================

const globalErrorHandler =
    (
        err,
        req,
        res,
        next
    ) => {

        // ==========================================
        // DEFAULT VALUES
        // ==========================================

        err.statusCode =
            err.statusCode || 500

        err.status =
            err.status || 'error'

        // ==========================================
        // LOG ERROR
        // ==========================================

        console.error(err)

        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(err.statusCode).json({

            success: false,

            status:
                err.status,

            message:
                err.message ||

                'Internal Server Error'

        })

    }

export default globalErrorHandler