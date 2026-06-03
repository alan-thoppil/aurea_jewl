import jwt from 'jsonwebtoken'

// ============================================
// AUTH MIDDLEWARE
// ============================================

export const authenticateUser =
    async (req, res, next) => {

        try {

            // ========================================
            // GET AUTH HEADER
            // ========================================

            const authHeader =
                req.headers.authorization

            if (!authHeader) {

                return res.status(401).json({

                    success: false,

                    message:
                        'Authorization header missing'

                })

            }

            // ========================================
            // EXTRACT TOKEN
            // ========================================

            const token =
                authHeader.split(' ')[1]

            if (!token) {

                return res.status(401).json({

                    success: false,

                    message:
                        'Token missing'

                })

            }

            // ========================================
            // VERIFY TOKEN
            // ========================================

            const decoded =
                jwt.verify(

                    token,

                    process.env.JWT_SECRET
                    || 'aurea_super_secret_key'

                )

            // ========================================
            // ATTACH USER
            // ========================================

            req.user = {

                id:
                    decoded.id,

                email:
                    decoded.email,

                role:
                    decoded.role
                    || 'customer'

            }

            next()

        } catch (error) {

            return res.status(401).json({

                success: false,

                message:
                    'Invalid or expired token',

                error:
                    error.message

            })

        }

    }