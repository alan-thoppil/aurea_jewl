// ============================================
// ROLE AUTHORIZATION MIDDLEWARE
// ============================================

export const authorizeRoles =
    (...allowedRoles) => {

        return (

            req,
            res,
            next

        ) => {

            // ========================================
            // NO USER
            // ========================================

            if (!req.user) {

                return res.status(401).json({

                    success: false,

                    message:
                        'Unauthorized'

                })

            }

            // ========================================
            // ROLE CHECK
            // ========================================

            if (

                !allowedRoles.includes(
                    req.user.role
                )

            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        'Forbidden'

                })

            }

            next()

        }

    }