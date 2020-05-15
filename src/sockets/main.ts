import { Express } from "express"
import socketIo from "socket.io"
import { DomainEnvironment } from "../domain/adapters"
import { buildSocketsAdapter } from "./adapters"
import { socketHandler } from "./handlers"

export const createSocketApp = (app: Express, port: number, domainAdapter: DomainEnvironment) => {
  const server = app.listen(port)
  const io = socketIo(server, {})
  const socketsAdapter = buildSocketsAdapter(io, domainAdapter)
  io.on("connection", socketHandler(socketsAdapter))

  return io
}
