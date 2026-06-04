import { supabase } from '../config/supabase.js'

import { createNotificationService }
    from './notification.service.js'

// ============================================
// LOW STOCK ALERT SERVICE
// ============================================

export const checkLowStockService = async ({
    product_id,
    quantity
}) => {

    // ============================================
    // LOW STOCK THRESHOLD
    // ============================================

    const LOW_STOCK_LIMIT = 5

    // ============================================
    // CHECK LOW STOCK
    // ============================================

    if (quantity <= LOW_STOCK_LIMIT) {

        // ==========================================
        // CREATE ADMIN NOTIFICATION
        // ==========================================

        let adminId;
        const { data: adminUsers } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .limit(1);

        if (adminUsers && adminUsers.length > 0) {
            adminId = adminUsers[0].id;
        } else {
            const { data: newAdmin } = await supabase
                .from('users')
                .insert([
                    {
                        full_name: 'System Admin',
                        email: 'admin@aurea.com',
                        password_hash: 'adminpassword_hash',
                        phone: '+91 99999 99999',
                        role: 'admin'
                    }
                ])
                .select('id')
                .single();
            if (newAdmin) {
                adminId = newAdmin.id;
            }
        }

        if (!adminId) {
            // Fallback: If for any reason we can't find or create an admin user,
            // we'll try to find the first user in the database to satisfy the constraint.
            const { data: anyUsers } = await supabase
                .from('users')
                .select('id')
                .limit(1);
            if (anyUsers && anyUsers.length > 0) {
                adminId = anyUsers[0].id;
            }
        }

        if (!adminId) {
            console.error("Could not find or create any user for notifications");
            return null;
        }

        const notification =
            await createNotificationService({

                user_id:
                    adminId,

                title:
                    'Low Stock Alert',

                message:
                    `Product ${product_id} is running low on stock. Remaining quantity: ${quantity}`,

                notification_type:
                    'INVENTORY'

            })

        return notification

    }

    return null

}