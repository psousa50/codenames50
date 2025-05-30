import { Server } from "http"
import socketIo from "socket.io"
import { SocketsEnvironment } from "./adapters"
import { socketHandler } from "./handlers"

export const createSocketsApplication = (server: Server, allowedOrigins: string[]) => {
  const io = socketIo(server, {
    origins: allowedOrigins,
    handlePreflightRequest: (req, res) => {
      const headers = {
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": req.headers.origin,
        "Access-Control-Allow-Credentials": "true",
      }
      res.writeHead(200, headers)
      res.end()
    },
  })

  return io
}

export const startSocketsApplication = (io: socketIo.Server, socketsEnvironment: SocketsEnvironment) => {
  io.on("connection", socketHandler(socketsEnvironment))
}
