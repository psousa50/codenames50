import socketIo from "socket.io"
import * as uuid from "uuid"
import { DomainEnvironment } from "../domain/adapters"
import { GamesDomainPorts, gamesDomainPorts } from "../domain/games"
import { GameMessagingEnvironment } from "../messaging/adapters"
import { GameMessagingPorts, gameMessagingPorts } from "../messaging/main"
import { Port } from "../utils/adapters"

export type SocketsEnvironment = {
  adapters: {
    gamesDomainPorts: GamesDomainPorts
    domainEnvironment: DomainEnvironment
    gameMessagingPorts: GameMessagingPorts
    gameMessagingEnvironment: GameMessagingEnvironment
    uuid: () => string
    io: socketIo.Server
  }
}

export type SocketsPort<I = void, R = void> = Port<SocketsEnvironment, I, R>

export const buildSocketsEnvironment = (
  io: socketIo.Server,
  domainEnvironment: DomainEnvironment,
  gameMessagingEnvironment: GameMessagingEnvironment,
): SocketsEnvironment => ({
  adapters: {
    gamesDomainPorts,
    domainEnvironment,
    gameMessagingPorts,
    gameMessagingEnvironment,
    uuid: uuid.v4,
    io,
  },
})
