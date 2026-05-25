import jwt from 'jsonwebtoken'

// ============================================
// TEST AUTH CONTROLLER
// ============================================

export const testAuthController = async (req, res) => {

    try {

        res.json({
            success: true,
            message: 'Auth controller working'
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            error: error.message
        })

    }

}

// ============================================
// LOGIN CONTROLLER
// ============================================

export const loginController = async (req, res) => {

    try {

        const demoUser = {
            id: 1,
            name: 'Alan Tom',
            role: 'admin',
            email: 'admin@aurea.com'
        }

        // ========================================
        // GENERATE TOKEN
        // ========================================

        const token = jwt.sign(
            demoUser,
            process.env.JWT_SECRET || 'aurea_super_secret_key',
            {
                expiresIn: '7d'
            }
        )

        // ========================================
        // RESPONSE
        // ========================================

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: demoUser
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            error: error.message
        })

    }

}