import { Server } from "http"
import socketIo from "socket.io"
import { SocketsEnvironment } from "./adapters"
import { socketHandler } from "./handlers"

export const createSocketsApplication = (server: Server) => {
  const io = socketIo(server, {
    origins: ["https://codenames50.netlify.app", "http://localhost:4000"],
  })

  return io
}

export const startSocketsApplication = (io: socketIo.Server, socketsEnvironment: SocketsEnvironment) => {
  io.on("connection", socketHandler(socketsEnvironment))
}
