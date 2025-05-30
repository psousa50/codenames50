import { Server } from "socket.io"
import { Messages } from "@codenames50/messaging"
import { log } from "../utils/logger"

export type MessengerEnvironment = {
  io: Server
}

export const emit =
  ({ io }: MessengerEnvironment) =>
  (socketId: string, message: Messages.GameMessage) => {
    log.debug("EMIT:", { type: message.type, socketId })
    const socket = io.sockets.sockets.get(socketId)
    if (socket) {
      socket.emit(message.type, message.data)
    } else {
      log.warn("Socket not found for emission", { socketId, messageType: message.type })
    }
  }

export const broadcast =
  ({ io }: MessengerEnvironment) =>
  (roomId: string, message: Messages.GameMessage) => {
    log.debug("BROADCAST:", { type: message.type, roomId })
    io.to(roomId).emit(message.type, message.data)
  }

export const getSocketIdsForRoomId =
  ({ io }: MessengerEnvironment) =>
  (roomId: string) => {
    const socketIds: string[] = []
    io.sockets.sockets.forEach((socket, socketId) => {
      if (socket.rooms.has(roomId)) {
        socketIds.push(socketId)
      }
    })
    return socketIds
  }

export const buildMessengerEnvironment = (io: Server) => ({
  io,
})

export const messengerPorts = {
  emit,
  broadcast,
  getSocketIdsForRoomId,
}

export type MessengerPorts = typeof messengerPorts
