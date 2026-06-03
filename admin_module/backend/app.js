import express from 'express'
import AppError from './utils/AppError.js'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'

// ============================================
// ROUTES
// ============================================

import authRoutes
    from './routes/auth.routes.js'

import productsRoutes
    from './routes/products.routes.js'

import ordersRoutes
    from './routes/orders.routes.js'

import inventoryRoutes
    from './routes/inventory.routes.js'

import paymentsRoutes
    from './routes/payments.routes.js'

import refundRoutes
    from './routes/refund.routes.js'

import analyticsRoutes
    from './routes/analytics.routes.js'

import adminRoutes
    from './routes/admin.routes.js'

import fileRoutes
    from './routes/file.routes.js'

import razorpayRoutes
    from './routes/razorpay.routes.js'

import webhookRoutes
    from './routes/webhook.routes.js'

import monitoringRoutes
    from './routes/monitoring.routes.js'

import systemActivityRoutes
    from './routes/system-activity.routes.js'

import uploadRoutes
    from './routes/upload.routes.js'

import productMediaRoutes
    from './routes/product-media.routes.js'

import categoriesRoutes
    from './routes/categories.routes.js'
import dashboardRoutes
    from './routes/dashboard.routes.js'

// ============================================
// MIDDLEWARES
// ============================================

import {

    apiLimiter

} from './middleware/rateLimit.middleware.js'

import globalErrorHandler
    from './middleware/error.middleware.js'

// ============================================
// EXPRESS APP
// ============================================

const app = express()

// ============================================
// CORE MIDDLEWARES
// ============================================

app.use(cors())

app.use(helmet())

app.use(express.json())

app.use(compression())

app.use(cookieParser())

app.use(morgan('dev'))

// ============================================
// RATE LIMITER
// ============================================

app.use(apiLimiter)

// ============================================
// STATIC FILES
// ============================================

app.use(

    '/uploads',

    express.static('uploads')

)

// ============================================
// ROOT ROUTE
// ============================================

app.get('/', (req, res) => {

    res.json({

        success: true,

        message:
            'AUREA API Running'

    })

})

// ============================================
// FAVICON ROUTE (Silence browser requests)
// ============================================

app.get('/favicon.ico', (req, res) => {

    res.status(204).end()

})

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authRoutes)

app.use('/api/products', productsRoutes)

app.use('/api/orders', ordersRoutes)

app.use('/api/inventory', inventoryRoutes)

app.use('/api/payments', paymentsRoutes)

app.use('/api/refunds', refundRoutes)

app.use('/api/analytics', analyticsRoutes)

app.use('/api/admin', adminRoutes)

app.use('/api/files', fileRoutes)

app.use('/api/razorpay', razorpayRoutes)

app.use('/api/webhooks', webhookRoutes)

app.use('/api/monitoring', monitoringRoutes)

app.use(
    '/api/system-activities',
    systemActivityRoutes
)

app.use('/api/uploads', uploadRoutes)

app.use(
    '/api/product-media',
    productMediaRoutes
)

app.use(
    '/api/categories',
    categoriesRoutes
)

app.use(
    '/api/dashboard',
    dashboardRoutes
)

// ============================================
// 404 HANDLER
// ============================================

app.all('*any', (req, res, next) => {

    next(
        new AppError(
            `Route not found: ${req.originalUrl}`,
            404
        )
    )

})

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use(globalErrorHandler)

// ============================================
// EXPORT APP
// ============================================

export default app