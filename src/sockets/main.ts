import cors from "cors"
import express from "express"
import socketIo from "socket.io"
import { SocketsEnvironment } from "./adapters"
import { socketHandler } from "./handlers"

export const createSocketsApplication = (port: number) => {
  const app = express()
  app.use(cors())
  const server = app.listen(port)
  const io = socketIo(server, {})

  return io
}

export const startSocketsApplication = (io: socketIo.Server, socketsEnvironment: SocketsEnvironment) => {
  io.on("connection", socketHandler(socketsEnvironment))
}
