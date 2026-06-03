import nodemailer from 'nodemailer'

// ============================================
// EMAIL TRANSPORTER
// ============================================

const transporter = nodemailer.createTransport({

    service: 'gmail',

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

})

// ============================================
// SEND EMAIL SERVICE
// ============================================

export const sendEmailService =
    async ({
        to,
        subject,
        html
    }) => {

        // ==========================================
        // EMAIL OPTIONS
        // ==========================================

        const mailOptions = {

            from:
                process.env.EMAIL_USER,

            to,

            subject,

            html

        }

        // ==========================================
        // SEND EMAIL
        // ==========================================

        const info =
            await transporter.sendMail(
                mailOptions
            )

        return info

    }