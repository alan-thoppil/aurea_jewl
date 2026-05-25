import { supabase } from '../config/supabase.js'

import {

    getCache,

    setCache

} from './cache.service.js'

// ============================================
// DASHBOARD ANALYTICS SERVICE
// ============================================

export const getDashboardAnalyticsService =
    async () => {

        // ==========================================
        // CHECK CACHE
        // ==========================================

        const cachedData =
            getCache('dashboard-analytics')

        if (cachedData) {

            console.log(
                'Serving analytics from cache'
            )

            return cachedData

        }

        // ==========================================
        // TOTAL ORDERS
        // ==========================================

        const {
            count: totalOrders
        } = await supabase
            .from('orders')
            .select('*', {
                count: 'exact',
                head: true
            })

        // ==========================================
        // TOTAL PRODUCTS
        // ==========================================

        const {
            count: totalProducts
        } = await supabase
            .from('products')
            .select('*', {
                count: 'exact',
                head: true
            })

        // ==========================================
        // TOTAL CUSTOMERS
        // ==========================================

        const {
            count: totalCustomers
        } = await supabase
            .from('customers')
            .select('*', {
                count: 'exact',
                head: true
            })

        // ==========================================
        // PAYMENTS
        // ==========================================

        const {
            data: payments
        } = await supabase
            .from('payments')
            .select('*')

        // ==========================================
        // TOTAL REVENUE
        // ==========================================

        const totalRevenue =
            payments?.reduce(

                (sum, payment) =>
                    sum + Number(payment.amount),

                0

            ) || 0

        // ==========================================
        // MONTHLY REVENUE
        // ==========================================

        const monthlyRevenue =
            payments?.reduce((acc, payment) => {

                const month =
                    new Date(
                        payment.created_at
                    ).toLocaleString(
                        'default',
                        { month: 'short' }
                    )

                acc[month] =
                    (acc[month] || 0)
                    + Number(payment.amount)

                return acc

            }, {})

        // ==========================================
        // LOW STOCK PRODUCTS
        // ==========================================

        const {
            data: lowStockProducts
        } = await supabase
            .from('inventory')
            .select('*')
            .lte('quantity', 5)

        // ==========================================
        // TOP SELLING PRODUCTS
        // ==========================================

        const {
            data: topProducts
        } = await supabase
            .from('order_items')
            .select(`
        product_id,
        quantity
      `)

        // ==========================================
        // PRODUCT SALES MAP
        // ==========================================

        const productSalesMap = {}

        topProducts?.forEach(item => {

            if (!productSalesMap[item.product_id]) {

                productSalesMap[item.product_id] = 0

            }

            productSalesMap[item.product_id] +=
                item.quantity

        })

        // ==========================================
        // SORT TOP PRODUCTS
        // ==========================================

        const sortedTopProducts =
            Object.entries(productSalesMap)

                .sort((a, b) => b[1] - a[1])

                .slice(0, 5)

        // ==========================================
        // FINAL ANALYTICS OBJECT
        // ==========================================

        const analyticsData = {

            totalOrders,

            totalProducts,

            totalCustomers,

            totalRevenue,

            monthlyRevenue,

            lowStockProductsCount:
                lowStockProducts?.length || 0,

            topSellingProducts:
                sortedTopProducts

        }

        // ==========================================
        // STORE CACHE
        // ==========================================

        setCache(
            'dashboard-analytics',
            analyticsData,
            60
        )

        // ==========================================
        // RETURN DATA
        // ==========================================

        return analyticsData

    }