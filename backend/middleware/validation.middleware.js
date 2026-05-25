export const validate = (schema) => {

    return async (req, res, next) => {

        try {

            // ============================================
            // VALIDATE REQUEST BODY
            // ============================================

            schema.parse(req.body)

            next()

        } catch (error) {

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors
            })

        }

    }

}