import * as Actions from "../utils/actions"
import socketIo from "socket.io"
import { ServiceError } from "../utils/audit"
import { DomainEnvironment } from "../domain/adapters"
import { GamesDomainPorts, gamesDomainPorts } from "../domain/games"

export type SocketsAdapter = {
  adapters: {
    gamesDomain: GamesDomainPorts
    domain: DomainEnvironment
    io: socketIo.Server
  }
}

export type SocketsActionResult<R = void> = Actions.ActionResult<SocketsAdapter, R>
export type SocketsAction<I = void, R = void> = Actions.Action<SocketsAdapter, I, R>

export function ask() {
  return Actions.ask<SocketsAdapter>()
}

export const actionOf = <R>(v: R) => Actions.actionOf<SocketsAdapter, R>(v)
export const actionErrorOf = <R>(error: ServiceError) => Actions.actionErrorOf<SocketsAdapter, R>(error)

export const withEnv = <R>(f: (env: SocketsAdapter) => SocketsActionResult<R>) => Actions.withEnv<SocketsAdapter, R>(f)

export const buildSocketsAdapter = (io: socketIo.Server, domainAdapter: DomainEnvironment): SocketsAdapter => ({
  adapters: {
    gamesDomain: gamesDomainPorts,
    domain: domainAdapter,
    io,
  },
})
