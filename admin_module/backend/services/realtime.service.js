// ============================================
// SOCKET IO INSTANCE
// ============================================

let io = null

// ============================================
// SET SOCKET INSTANCE
// ============================================

export const setSocketServer =
    (socketServer) => {

        io = socketServer

    }

// ============================================
// EMIT GLOBAL EVENT
// ============================================

export const emitEventService =
    ({
        event,
        data
    }) => {

        if (!io) {

            console.log(
                'Socket.IO not initialized'
            )

            return

        }

        io.emit(
            event,
            data
        )

    }

// ============================================
// EMIT ROOM EVENT
// ============================================

export const emitRoomEventService =
    ({
        room,
        event,
        data
    }) => {

        if (!io) {

            console.log(
                'Socket.IO not initialized'
            )

            return

        }

        io.to(room).emit(
            event,
            data
        )

    }