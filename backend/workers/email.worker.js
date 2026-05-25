import { Worker }
    from 'bullmq'

import {

    redisConnection

} from '../config/redis.js'

import {

    sendEmailService

} from '../services/email.service.js'

// ============================================
// EMAIL WORKER
// ============================================

// TODO: Restore live Redis-based BullMQ Worker once Redis server is running locally.
/*
const emailWorker =
    new Worker(

        'emailQueue',

        async (job) => {

            console.log(
                `Processing email job ${job.id}`
            )

            // ========================================
            // SEND EMAIL
            // ========================================

            await sendEmailService(
                job.data
            )

        },

        {
            connection:
                redisConnection,

            // ========================================
            // RETRY SETTINGS
            // ========================================

            attempts: 3,

            backoff: {
                type: 'exponential',
                delay: 3000
            }

        }

    )

// ============================================
// COMPLETED
// ============================================

emailWorker.on(
    'completed',
    (job) => {

        console.log(
            `Email job completed ${job.id}`
        )

    }
)

// ============================================
// FAILED
// ============================================

emailWorker.on(
    'failed',
    (job, err) => {

        console.error(

            `Email job failed ${job.id}`,

            err.message

        )

    }
)
*/

// Temporary Mock/Stub for emailWorker to keep architecture clean and prevent crashes.
export const emailWorker = {
    on: (event, handler) => {
        console.log(`[Worker Mock] Registered event listener for: ${event}`);
    }
};