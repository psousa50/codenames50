import socketIo from "socket.io"
import { GameMessage } from "./models"

export const emit = (io: socketIo.Server) => (socketId: string, message: GameMessage) => {
  io.sockets.sockets[socketId].emit(message.type, message.data)
}

export const broadcast = (io: socketIo.Server) => (roomId: string, message: GameMessage) => {
  io.to(roomId).emit(message.type, message.data)
}

export const messengerPorts = {
  emit,
  broadcast,
}

export type MessengerPorts = typeof messengerPorts
