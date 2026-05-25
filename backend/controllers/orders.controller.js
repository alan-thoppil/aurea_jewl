import {

    createOrderService

} from '../services/orders.service.js'

import {

    updateOrderStatusService

} from '../services/order-status.service.js'

import {

    cancelOrderService

} from '../services/returns.service.js'

import {

    successResponse,

    errorResponse

} from '../utils/apiResponse.js'

// ============================================
// TEST ORDERS CONTROLLER
// ============================================

export const testOrdersController =
    async (req, res) => {

        try {

            successResponse(res, {

                message:
                    'Orders controller working'

            })

        } catch (error) {

            errorResponse(res, {

                message:
                    'Orders controller failed',

                error:
                    error.message

            })

        }

    }

// ============================================
// CREATE ORDER CONTROLLER
// ============================================

export const createOrderController =
    async (req, res) => {

        try {

            const result =
                await createOrderService(
                    req.body
                )

            successResponse(res, {

                message:
                    'Order created successfully',

                data:
                    result

            })

        } catch (error) {

            errorResponse(res, {

                message:
                    'Failed to create order',

                error:
                    error.message

            })

        }

    }

// ============================================
// UPDATE ORDER STATUS CONTROLLER
// ============================================

export const updateOrderStatusController =
    async (req, res) => {

        try {

            const result =
                await updateOrderStatusService({

                    order_id:
                        req.params.id,

                    status:
                        req.body.status

                })

            successResponse(res, {

                message:
                    'Order status updated',

                data:
                    result

            })

        } catch (error) {

            errorResponse(res, {

                message:
                    'Failed to update order status',

                error:
                    error.message

            })

        }

    }

// ============================================
// CANCEL ORDER CONTROLLER
// ============================================

export const cancelOrderController =
    async (req, res) => {

        try {

            const result =
                await cancelOrderService(

                    req.params.id

                )

            successResponse(res, {

                message:
                    'Order cancelled',

                data:
                    result

            })

        } catch (error) {

            errorResponse(res, {

                message:
                    'Failed to cancel order',

                error:
                    error.message

            })

        }

    }