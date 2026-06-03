import {
    emailQueue
} from '../queues/email.queue.js'

// ============================================
// GET FAILED EMAIL JOBS
// ============================================

export const getFailedEmailJobsService =
    async () => {

        const failedJobs =
            await emailQueue.getFailed()

        return failedJobs.map(job => ({

            id:
                job.id,

            data:
                job.data,

            failedReason:
                job.failedReason

        }))

    }