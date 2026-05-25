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

// Temporary Mock for Queue to prevent connection crashes and run jobs synchronously.
export const emailQueue = {
    add: async (name, data, opts) => {
        console.log(`[Queue Mock] Job added synchronously: ${name}`, data);
        return { id: 'mock-job-id', name, data };
    },
    getFailed: async () => [],
    getWaitingCount: async () => 0,
    getFailedCount: async () => 0,
    getCompletedCount: async () => 0
};