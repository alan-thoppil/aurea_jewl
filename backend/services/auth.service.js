import jwt from 'jsonwebtoken'

// ============================================
// LOGIN SERVICE
// ============================================

export const loginService = async () => {

    // ============================================
    // DEMO USER
    // ============================================

    const demoUser = {

        id: 1,

        name: 'Demo Admin',

        role: null,

        email: 'admin@aurea.com'

    }

    // ============================================
    // GENERATE JWT TOKEN
    // ============================================

    const token = jwt.sign(

        demoUser,

        process.env.JWT_SECRET
        || 'aurea_super_secret_key',

        {
            expiresIn: '7d'
        }

    )

    // ============================================
    // RETURN AUTH DATA
    // ============================================

    return {

        token,

        user: demoUser

    }

}