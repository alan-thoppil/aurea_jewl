// ============================================
// ADMIN MIDDLEWARE
// ============================================

export const adminOnly = (

    req,

    res,

    next

) => {

    // ==========================================
    // CHECK AUTH
    // ==========================================

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message:
                'Unauthorized'

        })

    }

    // ==========================================
    // CHECK ROLE
    // ==========================================

    if (

        req.user.role !== 'admin'

    ) {

        return res.status(403).json({

            success: false,

            message:
                'Admin access required'

        })

    }

    // ==========================================
    // NEXT
    // ==========================================

    next()

}