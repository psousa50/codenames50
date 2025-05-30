import { Server } from "http"
import socketIo from "socket.io"
import { SocketsEnvironment } from "./adapters"
import { socketHandler } from "./handlers"

export const createSocketsApplication = (server: Server, allowedOrigins: string[]) => {
  const io = socketIo(server, {
    origins: allowedOrigins,
  })

  return io
}

export const startSocketsApplication = (io: socketIo.Server, socketsEnvironment: SocketsEnvironment) => {
  io.on("connection", socketHandler(socketsEnvironment))
}
