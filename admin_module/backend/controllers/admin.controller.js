import { supabase } from '../config/supabase.js'

// ============================================
// GET ALL ORDERS
// ============================================

export const getAllOrdersController =
    async (req, res) => {

        try {

            const {
                data: orders,
                error: ordersError
            } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', {
                    ascending: false
                })

            if (ordersError) {
                throw new Error(ordersError.message)
            }

            if (!orders || orders.length === 0) {
                return res.json({ success: true, data: [] })
            }

            // Extract unique IDs
            const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))]
            const orderIds = orders.map(o => o.id)

            // Fetch Customers in one query
            const { data: customers, error: custError } = await supabase
                .from('customers')
                .select('*')
                .in('id', userIds)

            if (custError) throw new Error(custError.message)

            // Fetch Order Items in one query
            const { data: orderItems, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .in('order_id', orderIds)

            if (itemsError) throw new Error(itemsError.message)

            // Fetch Products referenced by order items
            const productIds = [...new Set(orderItems.map(oi => oi.product_id).filter(Boolean))]
            let products = []
            if (productIds.length > 0) {
                const { data: prods, error: prodError } = await supabase
                    .from('products')
                    .select('*')
                    .in('id', productIds)
                if (prodError) throw new Error(prodError.message)
                products = prods
            }

            // Fetch Payments
            const { data: payments, error: payError } = await supabase
                .from('payments')
                .select('*')
                .in('order_id', orderIds)

            if (payError) throw new Error(payError.message)

            // Fetch Invoices
            const { data: invoices, error: invError } = await supabase
                .from('invoices')
                .select('*')
                .in('order_id', orderIds)

            if (invError) throw new Error(invError.message)

            // Map database records into rich orders structure
            const richOrders = orders.map(order => {
                const customer = customers.find(c => c.id === order.user_id)
                const relativeItems = orderItems.filter(oi => oi.order_id === order.id)
                const mappedItems = relativeItems.map(ri => {
                    const prod = products.find(p => p.id === ri.product_id)
                    return {
                        sku: prod ? prod.sku : '',
                        name: prod ? prod.name : 'Unknown Product',
                        quantity: ri.quantity,
                        price: Number(ri.price)
                    }
                })

                const payment = payments.find(p => p.order_id === order.id)
                const invoice = invoices.find(i => i.order_id === order.id)

                // Subtotal and tax calculations
                const subtotal = invoice ? Number(invoice.subtotal) : (Number(order.total_amount) / 1.03)
                const gst = invoice ? (Number(invoice.cgst_amount) + Number(invoice.sgst_amount)) : (Number(order.total_amount) - subtotal)

                return {
                    id: order.id,
                    order_number: invoice ? invoice.invoice_number : `AUR-${order.id.slice(-6).toUpperCase()}`,
                    customer_id: customer ? customer.id : null,
                    customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 'Guest Customer',
                    customer_email: customer ? customer.email : '',
                    customer_phone: customer ? customer.phone : '',
                    items: mappedItems,
                    subtotal: parseFloat(subtotal.toFixed(2)),
                    making_charges: 0,
                    gst: parseFloat(gst.toFixed(2)),
                    total: Number(order.total_amount),
                    payment_method: payment ? payment.payment_method : 'Razorpay',
                    payment_status: order.payment_status || (payment ? payment.payment_status : 'pending'),
                    created_at: order.created_at,
                    order_status: order.order_status
                }
            })

            res.json({
                success: true,
                data: richOrders
            })

        } catch (error) {

            res.status(500).json({
                success: false,
                error: error.message
            })

        }

    }

// ============================================
// GET ALL PRODUCTS
// ============================================

export const getAllProductsController =
    async (req, res) => {

        try {

            const {
                data,
                error
            } = await supabase
                .from('products')
                .select('*')

            if (error) {
                throw new Error(error.message)
            }

            res.json({
                success: true,
                data
            })

        } catch (error) {

            res.status(500).json({
                success: false,
                error: error.message
            })

        }

    }

// ============================================
// GET ALL CUSTOMERS
// ============================================

export const getAllCustomersController =
    async (req, res) => {

        try {

            const {
                data,
                error
            } = await supabase
                .from('customers')
                .select('*')

            if (error) {
                throw new Error(error.message)
            }

            const formattedCustomers = data.map(c => ({
                id: c.id,
                name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
                email: c.email || '',
                phone: c.phone || '',
                loyalty_points: c.loyalty_points_balance || 0,
                birthday: c.date_of_birth || '',
                gold_scheme_status: 'Inactive',
                scheme_id: null
            }));

            res.json({
                success: true,
                data: formattedCustomers
            })

        } catch (error) {

            res.status(500).json({
                success: false,
                error: error.message
            })

        }

    }

// ============================================
// CREATE CUSTOMER CONTROLLER
// ============================================
export const createCustomerController = async (req, res) => {
    try {
        const { name, email, phone, birthday } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const nameParts = (name || 'Guest').trim().split(/\s+/);
        const firstName = nameParts[0] || 'Guest';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { data, error } = await supabase
            .from('customers')
            .insert({
                first_name: firstName,
                last_name: lastName,
                email,
                phone: phone || '+91 99999 99999',
                date_of_birth: birthday || null
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        res.status(201).json({
            success: true,
            message: 'Customer enrolled successfully',
            data: {
                id: data.id,
                name: `${data.first_name} ${data.last_name || ''}`.trim(),
                email: data.email,
                phone: data.phone,
                birthday: data.date_of_birth || '',
                loyalty_points: data.loyalty_points_balance || 0,
                gold_scheme_status: 'Inactive',
                scheme_id: null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// UPDATE CUSTOMER CONTROLLER
// ============================================
export const updateCustomerController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, birthday, loyalty_points } = req.body;

        const updateData = {};
        if (name !== undefined) {
            const nameParts = name.trim().split(/\s+/);
            updateData.first_name = nameParts[0] || '';
            updateData.last_name = nameParts.slice(1).join(' ') || '';
        }
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (birthday !== undefined) updateData.date_of_birth = birthday || null;
        if (loyalty_points !== undefined) updateData.loyalty_points_balance = loyalty_points;

        const { data, error } = await supabase
            .from('customers')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        res.json({
            success: true,
            message: 'Customer profile updated',
            data: {
                id: data.id,
                name: `${data.first_name} ${data.last_name || ''}`.trim(),
                email: data.email,
                phone: data.phone,
                birthday: data.date_of_birth || '',
                loyalty_points: data.loyalty_points_balance || 0,
                gold_scheme_status: 'Inactive',
                scheme_id: null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET LOW STOCK PRODUCTS
// ============================================

export const getLowStockProductsController =
    async (req, res) => {

        try {

            const {
                data,
                error
            } = await supabase
                .from('inventory')
                .select('*')
                .lte('quantity', 5)

            if (error) {
                throw new Error(error.message)
            }

            res.json({
                success: true,
                data
            })

        } catch (error) {

            res.status(500).json({
                success: false,
                error: error.message
            })

        }

    }
// ============================================
// SEARCH PRODUCTS
// ============================================

export const searchProductsController =
    async (req, res) => {

        try {

            const {
                search,
                category
            } = req.query

            let query =
                supabase
                    .from('products')
                    .select('*')

            // ========================================
            // SEARCH FILTER
            // ========================================

            if (search) {

                query =
                    query.ilike(
                        'name',
                        `%${search}%`
                    )

            }

            // ========================================
            // CATEGORY FILTER
            // ========================================

            if (category) {

                query =
                    query.eq(
                        'category',
                        category
                    )

            }

            // ========================================
            // EXECUTE QUERY
            // ========================================

            const {
                data,
                error
            } = await query

            if (error) {
                throw new Error(error.message)
            }

            res.json({
                success: true,
                data
            })

        } catch (error) {

            res.status(500).json({

                success: false,

                error: error.message

            })

        }

    }
// ============================================
// FILTER ORDERS
// ============================================

export const filterOrdersController =
    async (req, res) => {

        try {

            const {
                status
            } = req.query

            let query =
                supabase
                    .from('orders')
                    .select('*')

            // ========================================
            // STATUS FILTER
            // ========================================

            if (status) {

                query =
                    query.eq(
                        'order_status',
                        status
                    )

            }

            // ========================================
            // EXECUTE QUERY
            // ========================================

            const {
                data,
                error
            } = await query

            if (error) {
                throw new Error(error.message)
            }

            res.json({

                success: true,

                data

            })

        } catch (error) {

            res.status(500).json({

                success: false,

                error: error.message

            })

        }

    }
// ============================================
// PAGINATED PRODUCTS
// ============================================

export const paginatedProductsController =
    async (req, res) => {

        try {

            // ========================================
            // QUERY PARAMS
            // ========================================

            const page =
                parseInt(req.query.page) || 1

            const limit =
                parseInt(req.query.limit) || 10

            // ========================================
            // CALCULATE RANGE
            // ========================================

            const from =
                (page - 1) * limit

            const to =
                from + limit - 1

            // ========================================
            // FETCH PRODUCTS
            // ========================================

            const {
                data,
                error,
                count
            } = await supabase
                .from('products')
                .select('*', {
                    count: 'exact'
                })
                .range(from, to)

            // ========================================
            // HANDLE ERROR
            // ========================================

            if (error) {
                throw new Error(error.message)
            }

            // ========================================
            // RESPONSE
            // ========================================

            res.json({

                success: true,

                pagination: {

                    page,

                    limit,

                    total: count,

                    totalPages:
                        Math.ceil(count / limit)

                },

                data

            })

        } catch (error) {

            res.status(500).json({

                success: false,

                error: error.message

            })

        }

    }
// ============================================
// PAGINATED ORDERS
// ============================================

export const paginatedOrdersController =
    async (req, res) => {

        try {

            // ========================================
            // QUERY PARAMS
            // ========================================

            const page =
                parseInt(req.query.page) || 1

            const limit =
                parseInt(req.query.limit) || 10

            // ========================================
            // CALCULATE RANGE
            // ========================================

            const from =
                (page - 1) * limit

            const to =
                from + limit - 1

            // ========================================
            // FETCH ORDERS
            // ========================================

            const {
                data,
                error,
                count
            } = await supabase
                .from('orders')
                .select('*', {
                    count: 'exact'
                })
                .range(from, to)

            // ========================================
            // HANDLE ERROR
            // ========================================

            if (error) {
                throw new Error(error.message)
            }

            // ========================================
            // RESPONSE
            // ========================================

            res.json({

                success: true,

                pagination: {

                    page,

                    limit,

                    total: count,

                    totalPages:
                        Math.ceil(count / limit)

                },

                data

            })

        } catch (error) {

            res.status(500).json({

                success: false,

                error: error.message

            })

        }

    }