import socketIo from "socket.io"
import { Express } from "express"
import { socketHandler } from "./handler"
import { DomainEnvironment } from "../domain/adapters"
import { buildSocketsAdapter } from "./adapters"

export const createSocketApp = (app: Express, port: number, domainAdapter: DomainEnvironment) => {
  const server = app.listen(port)
  const io = socketIo(server, {})
  const socketsAdapter = buildSocketsAdapter(io, domainAdapter)
  io.on("connection", socketHandler(socketsAdapter))

  return io
}
