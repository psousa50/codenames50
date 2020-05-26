import { pipe } from "fp-ts/lib/pipeable"
import { chain, map, mapLeft, run } from "fp-ts/lib/ReaderTaskEither"
import { task } from "fp-ts/lib/Task"
import { UserSocketLink } from "../messaging/main"
import * as Messages from "../messaging/messages"
import { actionOf, withEnv } from "../utils/actions"
import { adapt } from "../utils/adapters"
import { SocketsEnvironment, SocketsPort } from "./adapters"

type CreateGameInput = {
  gameId?: string
  userId: string
  language: string
}

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

export const registerUserHandler: SocketHandler<Messages.RegisterUserSocketInput> = socket => ({ userId }) =>
  withEnv(({ gameMessagingPorts, gameMessagingEnvironment }) =>
    pipe(adapt(gameMessagingPorts.registerUser({ userId, socketId: socket.id }), gameMessagingEnvironment)),
  )

const removeUserFromGame: SocketsPort<UserSocketLink[]> = userLinks =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) => {
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

export const disconnectHandler: SocketHandler = socket => () => {
  console.log("DISCONNECT=====>\n", socket.id)
  return withEnv(({ gameMessagingPorts, gameMessagingEnvironment }) =>
    pipe(
      adapt(gameMessagingPorts.unregisterSocket({ socketId: socket.id }), gameMessagingEnvironment),
      chain(removeUserFromGame),
      map(_ => undefined),
    ),
  )
}

export const createGameHandler: SocketHandler<CreateGameInput> = socket => ({ gameId, userId, language }) =>
  withEnv(({ gamesDomainPorts, domainEnvironment, uuid, gameMessagingPorts, gameMessagingEnvironment }) => {
    const newGameId = gameId || uuid()
    socket.join(newGameId, async (_: any) => {
      const h = pipe(
        gamesDomainPorts.create({ gameId: newGameId, userId, language }),
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

export const joinGameHandler: SocketHandler<Messages.JoinGameInput> = socket => input => {
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

export const removePlayerHandler: SocketHandler<Messages.RemovePlayerInput> = _ => input =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) =>
    pipe(
      adapt(gamesDomainPorts.removePlayer(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const joinTeamHandler: SocketHandler<Messages.JoinTeamInput> = _ => input =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) =>
    pipe(
      adapt(gamesDomainPorts.joinTeam(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const setSpyMasterHandler: SocketHandler<Messages.SetSpyMasterInput> = _ => input =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) =>
    pipe(
      adapt(gamesDomainPorts.setSpyMaster(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const startGameHandler: SocketHandler<Messages.StartGameInput> = _ => input =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) =>
    pipe(
      adapt(gamesDomainPorts.startGame(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const sendHintHandler: SocketHandler<Messages.SendHintInput> = _ => input =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) =>
    pipe(
      adapt(gamesDomainPorts.sendHint(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const revealWordHandler: SocketHandler<Messages.RevealWordInput> = _ => input =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) =>
    pipe(
      adapt(gamesDomainPorts.revealWord(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const changeTurnHandler: SocketHandler<Messages.ChangeTurnInput> = _ => input =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) =>
    pipe(
      adapt(gamesDomainPorts.changeTurn(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const socketHandler = (env: SocketsEnvironment) => (socket: SocketIO.Socket) => {
  addMessageHandler(env)(socket, "disconnect", disconnectHandler)
  addMessageHandler(env)(socket, "registerUserSocket", registerUserHandler)
  addMessageHandler(env)(socket, "createGame", createGameHandler)
  addMessageHandler(env)(socket, "joinGame", joinGameHandler)
  addMessageHandler(env)(socket, "removePlayer", removePlayerHandler)
  addMessageHandler(env)(socket, "joinTeam", joinTeamHandler)
  addMessageHandler(env)(socket, "setSpyMaster", setSpyMasterHandler)
  addMessageHandler(env)(socket, "startGame", startGameHandler)
  addMessageHandler(env)(socket, "sendHint", sendHintHandler)
  addMessageHandler(env)(socket, "revealWord", revealWordHandler)
  addMessageHandler(env)(socket, "changeTurn", changeTurnHandler)
}
