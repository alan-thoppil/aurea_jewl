import { Queue }
    from 'bullmq'

import {

    redisConnection

} from '../config/redis.js'

// ============================================
// EMAIL QUEUE
// ============================================

// TODO: Restore live Redis-based BullMQ Queue once Redis server is running locally.
/*
export const emailQueue =
    new Queue(

        'emailQueue',

        {

            connection:
                redisConnection,

            defaultJobOptions: {

                removeOnComplete: true,

                removeOnFail: false,

                attempts: 3,

                backoff: {

                    type: 'exponential',

                    delay: 3000

                }

            }

        }

    )
*/

import { sendEmailService } from '../services/email.service.js';

// Temporary Mock for Queue to prevent connection crashes and run jobs synchronously.
export const emailQueue = {
    add: async (name, data, opts) => {
        console.log(`[Queue Mock] Job added synchronously: ${name}`, data);
        if (data && (data.to || data.email)) {
            try {
                await sendEmailService({
                    to: data.to || data.email,
                    subject: data.subject || "Aurea Restorations & Fine Jewelry",
                    html: data.html
                });
                console.log(`[Queue Mock] Email sent successfully to ${data.to || data.email}`);
            } catch (err) {
                console.error(`[Queue Mock] Error sending email synchronously:`, err.message);
            }
        }
        return { id: 'mock-job-id', name, data };
    },
    getFailed: async () => [],
    getWaitingCount: async () => 0,
    getFailedCount: async () => 0,
    getCompletedCount: async () => 0
};