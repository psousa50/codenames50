import socketIo from "socket.io"
import { Messages } from "@codenames50/messaging"

export type MessengerEnvironment = {
  io: socketIo.Server
}

export const emit = ({ io }: MessengerEnvironment) => (socketId: string, message: Messages.GameMessage) => {
  console.log("EMIT:", message.type)
  io.sockets.sockets[socketId].emit(message.type, message.data)
}

export const broadcast = ({ io }: MessengerEnvironment) => (roomId: string, message: Messages.GameMessage) => {
  console.log("BROADCAST:", message.type)
  io.to(roomId).emit(message.type, message.data)
}

export const getSocketIdsForRoomId = ({ io }: MessengerEnvironment) => (roomId: string) =>
  Object.keys(io.sockets.sockets).filter(socketId => {
    const rooms = io.sockets.sockets[socketId].rooms
    return Object.keys(rooms).includes(roomId)
  })

export const buildMessengerEnvironment = (io: socketIo.Server) => ({
  io,
})

export const messengerPorts = {
  emit,
  broadcast,
  getSocketIdsForRoomId,
}

export type MessengerPorts = typeof messengerPorts
