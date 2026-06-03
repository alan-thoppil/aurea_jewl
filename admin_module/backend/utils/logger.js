import winston from 'winston'

// ============================================
// LOGGER CONFIGURATION
// ============================================

const logger = winston.createLogger({

    level: 'info',

    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),

    transports: [

        // ========================================
        // CONSOLE LOGGING
        // ========================================

        new winston.transports.Console(),

        // ========================================
        // ERROR LOG FILE
        // ========================================

        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        }),

        // ========================================
        // COMBINED LOG FILE
        // ========================================

        new winston.transports.File({
            filename: 'logs/combined.log'
        })

    ]

})

export default logger