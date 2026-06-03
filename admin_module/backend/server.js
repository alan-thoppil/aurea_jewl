import dotenv from 'dotenv'

dotenv.config()

import http from 'http'

import { Server } from 'socket.io'

import app from './app.js'

import logger from './utils/logger.js'

// ============================================
// CREATE HTTP SERVER
// ============================================

const server =
    http.createServer(app)

// ============================================
// SOCKET.IO SERVER
// ============================================

export const io =
    new Server(server, {

        cors: {

            origin: '*'

        }

    })

// ============================================
// SOCKET CONNECTION
// ============================================

io.on('connection', (socket) => {

    console.log(
        `Socket connected: ${socket.id}`
    )

    // ==========================================
    // JOIN ROOM
    // ==========================================

    socket.on('join-room', (room) => {

        socket.join(room)

        console.log(
            `Socket ${socket.id} joined ${room}`
        )

    })

    // ==========================================
    // DISCONNECT
    // ==========================================

    socket.on('disconnect', () => {

        console.log(
            `Socket disconnected: ${socket.id}`
        )

    })

})

// ============================================
// SERVER PORT
// ============================================

const PORT =
    process.env.PORT || 5000

// ============================================
// START SERVER
// ============================================

server.listen(PORT, () => {

    logger.info(
        `Server running on http://localhost:${PORT}`
    )

    console.log(
        `\n\x1b[1m\x1b[36m⚡ AUREA × JEWELPRO API\x1b[0m \x1b[32mis running on:\x1b[0m http://localhost:${PORT}\n`
    )

})