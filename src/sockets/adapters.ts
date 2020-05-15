import socketIo from "socket.io"
import { buildGamesDomainAdapters, DomainEnvironment, GamesDomainAdapters } from "../domain/adapters"
import { Port } from "../utils/adapters"

export type SocketsEnvironment = {
  adapters: {
    gamesDomain: GamesDomainAdapters
    io: socketIo.Server
  }
}

export type SocketsPort<I = void, R = void> = Port<SocketsEnvironment, I, R>

export const buildSocketsAdapter = (io: socketIo.Server, domainEnvironment: DomainEnvironment): SocketsEnvironment => ({
  adapters: {
    gamesDomain: buildGamesDomainAdapters(domainEnvironment),
    io,
  },
})
