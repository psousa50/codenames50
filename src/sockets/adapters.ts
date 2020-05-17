import socketIo from "socket.io"
import * as uuid from "uuid"
import { DomainEnvironment } from "../domain/adapters"
import { GamesDomainPorts } from "../domain/games"
import { GameMessagingEnvironment } from "../messaging/adapters"
import { GameMessagingPorts } from "../messaging/main"
import { Port } from "../utils/adapters"

export type SocketsPort<I = void, R = void> = Port<SocketsEnvironment, I, R>

export const buildSocketsEnvironment = (
  io: socketIo.Server,
  domainEnvironment: DomainEnvironment,
  gamesDomainPorts: GamesDomainPorts,
  gameMessagingEnvironment: GameMessagingEnvironment,
  gameMessagingPorts: GameMessagingPorts,
) => ({
  domainEnvironment,
  gamesDomainPorts,
  gameMessagingEnvironment,
  gameMessagingPorts,
  uuid: uuid.v4,
  io,
})

export type SocketsEnvironment = ReturnType<typeof buildSocketsEnvironment>
