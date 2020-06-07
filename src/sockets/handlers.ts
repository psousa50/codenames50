import { pipe } from "fp-ts/lib/pipeable"
import { chain, map, mapLeft, run } from "fp-ts/lib/ReaderTaskEither"
import { task } from "fp-ts/lib/Task"
import { DomainPort } from "../domain/adapters"
import { UserSocketLink } from "../messaging/main"
import * as Messages from "../messaging/messages"
import { actionOf, withEnv } from "../utils/actions"
import { adapt } from "../utils/adapters"
import { SocketsEnvironment, SocketsPort } from "./adapters"

type SocketHandler<T = void> = (socket: SocketIO.Socket) => SocketsPort<T, void>

const addMessageHandler = (socketsEnvironment: SocketsEnvironment) => <T>(
  socket: SocketIO.Socket,
  type: Messages.GameMessageType,
  messageHandler: SocketHandler<T>,
) => {
  const handler = async (data: T) => {
    console.log("RECEIVED=====>\n", type, data)
    try {
      await run(
        pipe(
          messageHandler(socket)(data),
          mapLeft(e => {
            socket.emit("gameError", e)
          }),
        ),
        socketsEnvironment,
      )
    } catch (_) {}
  }

  socket.on(type, handler)

  return task.of(undefined)
}

const registerUserHandler: SocketHandler<Messages.RegisterUserSocketInput> = socket => ({ userId }) =>
  withEnv(({ gameMessagingPorts, gameMessagingEnvironment }) =>
    pipe(adapt(gameMessagingPorts.registerUser({ userId, socketId: socket.id }), gameMessagingEnvironment)),
  )

const removeUserFromGame: SocketsPort<UserSocketLink[]> = userLinks => {
  console.log("removeUserFromGame=====>\n", userLinks)
  return withEnv(({ gamesDomainPorts, domainEnvironment }) => {
    return pipe(
      userLinks.length === 1 && userLinks[0].gameId
        ? pipe(
            adapt(
              gamesDomainPorts.removePlayer({ gameId: userLinks[0].gameId, userId: userLinks[0].userId }),
              domainEnvironment,
            ),
            map(_ => undefined),
          )
        : actionOf(undefined as any),
      map(_ => undefined),
    )
  })
}
const disconnectHandler: SocketHandler = socket => () => {
  console.log("DISCONNECT=====>\n", socket.id)
  return withEnv(({ gameMessagingPorts, gameMessagingEnvironment }) =>
    pipe(
      adapt(gameMessagingPorts.unregisterSocket({ socketId: socket.id }), gameMessagingEnvironment),
      chain(removeUserFromGame),
      map(_ => undefined),
    ),
  )
}

const createGameHandler: SocketHandler<Messages.CreateGameInput> = socket => ({ gameId, userId }) =>
  withEnv(({ gamesDomainPorts, domainEnvironment, uuid, gameMessagingPorts, gameMessagingEnvironment }) => {
    const newGameId = gameId || uuid()
    socket.join(newGameId, async (_: any) => {
      const h = pipe(
        gamesDomainPorts.create({ gameId: newGameId, userId }),
        chain(game =>
          adapt(
            gameMessagingPorts.addGameToUser({ socketId: socket.id, gameId: game.gameId, userId }),
            gameMessagingEnvironment,
          ),
        ),
      )
      await run(h, domainEnvironment)
    })
    return actionOf(undefined)
  })

const joinGameHandler: SocketHandler<Messages.JoinGameInput> = socket => input => {
  return withEnv(({ gamesDomainPorts, domainEnvironment, gameMessagingPorts, gameMessagingEnvironment }) => {
    socket.join(input.gameId, async (_: any) => {
      const h = pipe(
        gamesDomainPorts.join(input),
        chain(game =>
          adapt(
            gameMessagingPorts.addGameToUser({ socketId: socket.id, gameId: game.gameId, userId: input.userId }),
            gameMessagingEnvironment,
          ),
        ),
      )
      await run(h, domainEnvironment)
    })
    return actionOf(undefined)
  })
}

const handleDomainPort = <I, O>(domainPort: DomainPort<I, O>): SocketHandler<I> => _ => (input: I) =>
  withEnv(({ domainEnvironment }) =>
    pipe(
      adapt(domainPort(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const socketHandler = (env: SocketsEnvironment) => (socket: SocketIO.Socket) => {
  addMessageHandler(env)(socket, "changeTurn", handleDomainPort(env.gamesDomainPorts.changeTurn))
  addMessageHandler(env)(socket, "createGame", createGameHandler)
  addMessageHandler(env)(socket, "disconnect", disconnectHandler)
  addMessageHandler(env)(socket, "joinGame", joinGameHandler)
  addMessageHandler(env)(socket, "joinTeam", handleDomainPort(env.gamesDomainPorts.joinTeam))
  addMessageHandler(env)(socket, "randomizeTeam", handleDomainPort(env.gamesDomainPorts.randomizeTeams))
  addMessageHandler(env)(socket, "registerUserSocket", registerUserHandler)
  addMessageHandler(env)(socket, "removePlayer", handleDomainPort(env.gamesDomainPorts.removePlayer))
  addMessageHandler(env)(socket, "restartGame", handleDomainPort(env.gamesDomainPorts.restartGame))
  addMessageHandler(env)(socket, "revealWord", handleDomainPort(env.gamesDomainPorts.revealWord))
  addMessageHandler(env)(socket, "sendHint", handleDomainPort(env.gamesDomainPorts.sendHint))
  addMessageHandler(env)(socket, "setSpyMaster", handleDomainPort(env.gamesDomainPorts.setSpyMaster))
  addMessageHandler(env)(socket, "startGame", handleDomainPort(env.gamesDomainPorts.startGame))
}
