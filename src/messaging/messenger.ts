import socketIo from "socket.io"
import { GameMessage } from "./messages"

export type MessengerEnvironment = {
  io: socketIo.Server
}

export const emit = ({ io }: MessengerEnvironment) => (socketId: string, message: GameMessage) => {
  io.sockets.sockets[socketId].emit(message.type, message.data)
}

export const broadcast = ({ io }: MessengerEnvironment) => (roomId: string, message: GameMessage) => {
  const skIds = Object.keys(io.sockets.sockets)
  const rooms = skIds.map(sk => ({
    socketId: sk,
    rks: Object.keys(io.sockets.sockets[sk].rooms),
  }))
  const rooms2 = rooms.map(ar => ({ ...ar, rooms: ar.rks.map(r => io.sockets.sockets[ar.socketId].rooms[r]) }))
  console.log("ROOMS=====>\n", rooms2)
  io.to(roomId).emit(message.type, message.data)
}

export const getSocketIdsForRoomId = ({ io }: MessengerEnvironment) => (roomId: string) => {
  const skIds = Object.keys(io.sockets.sockets)
  const rooms = skIds.map(sk => ({
    socketId: sk,
    rks: Object.keys(io.sockets.sockets[sk].rooms),
  }))
  const rooms2 = rooms.map(ar => ({ ...ar, rooms: ar.rks.map(r => io.sockets.sockets[ar.socketId].rooms[r]) }))
  console.log("=====>\n", rooms2)
  const socketIds = Object.keys(io.sockets.sockets).filter(socketId => {
    const rooms = io.sockets.sockets[socketId].rooms
    return Object.keys(rooms).includes(roomId)
  })

  console.log("socketIds=====>\n", socketIds)

  return socketIds
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
