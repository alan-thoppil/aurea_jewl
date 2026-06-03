import Redis from 'ioredis'

// ============================================
// REDIS CONNECTION
// ============================================

// TODO: Restore live Redis connection once Redis server is running locally.
/*
export const redisConnection =
    new Redis({

        host:
            process.env.REDIS_HOST,

        port:
            process.env.REDIS_PORT,

        password:
            process.env.REDIS_PASSWORD

    })
*/

// Temporary Mock Redis connection to prevent EADDRNOTAVAIL/ECONNREFUSED crashes.
export const redisConnection = {
    ping: async () => 'PONG',
    on: (event, handler) => {
        console.log(`[Redis Mock] Registered event listener for: ${event}`);
    },
    quit: async () => 'OK',
    disconnect: () => {}
};