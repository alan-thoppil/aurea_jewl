import { supabase }
    from '../config/supabase.js'

import {

    redisConnection

} from '../config/redis.js'

import {
    emailQueue
} from '../queues/email.queue.js'

// ============================================
// SYSTEM HEALTH SERVICE
// ============================================

export const getSystemHealthService =
    async () => {

        // ==========================================
        // DATABASE HEALTH
        // ==========================================

        let databaseStatus =
            'healthy'

        try {

            await supabase
                .from('orders')
                .select('*')
                .limit(1)

        } catch {

            databaseStatus =
                'unhealthy'

        }

        // ==========================================
        // REDIS HEALTH
        // ==========================================

        let redisStatus =
            'healthy'

        try {

            await redisConnection.ping()

        } catch {

            redisStatus =
                'unhealthy'

        }

        // ==========================================
        // QUEUE METRICS
        // ==========================================

        const waitingJobs =
            await emailQueue.getWaitingCount()

        const failedJobs =
            await emailQueue.getFailedCount()

        const completedJobs =
            await emailQueue.getCompletedCount()

        // ==========================================
        // MEMORY USAGE
        // ==========================================

        const memoryUsage =
            process.memoryUsage()

        // ==========================================
        // UPTIME
        // ==========================================

        const uptime =
            process.uptime()

        // ==========================================
        // RETURN STATUS
        // ==========================================

        return {

            status: 'operational',

            uptime,

            databaseStatus,

            redisStatus,

            queue: {

                waitingJobs,

                failedJobs,

                completedJobs

            },

            memoryUsage

        }

    }