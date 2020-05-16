import socketIo from "socket.io"
import { GameMessage } from "./messages"

export type MessengerEnvironment = {
  io: socketIo.Server
}

export const emit = ({ io }: MessengerEnvironment) => (socketId: string, message: GameMessage) => {
  io.sockets.sockets[socketId].emit(message.type, message.data)
}

export const broadcast = ({ io }: MessengerEnvironment) => (roomId: string, message: GameMessage) => {
  io.to(roomId).emit(message.type, message.data)
}

export const getSocketIdsForRoomId = ({ io }: MessengerEnvironment) => (roomId: string) => {
  const socketRooms = Object.keys(io.sockets.sockets).map(socketId => {
    const rooms = io.sockets.sockets[socketId].rooms
    return {
      socketId,
      roomId: rooms[Object.keys(rooms)[1]],
    }
  })

  return socketRooms.filter(sr => sr.roomId === roomId)
}

export const buildMessengerEnvironment = (io: socketIo.Server) => ({
  io,
})

export const messengerPorts = {
  emit,
  broadcast,
  getSocketIdsForRoomId,
}

export type MessengerPorts = typeof messengerPorts
