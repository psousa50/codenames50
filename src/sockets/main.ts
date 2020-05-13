import socketIo from "socket.io"
import { Express } from "express"
import { socketHandler } from "./handler"
import { DomainAdapter } from "../domain/adapters"

export const createSocketApp = (app: Express, port: number, domainAdapter: DomainAdapter) => {
  const server = app.listen(port)
  const io = socketIo(server, {})
  io.on("connection", socketHandler(domainAdapter, io))

  return io
}
