import { pipe } from "fp-ts/lib/pipeable"
import { map, mapLeft, run } from "fp-ts/lib/ReaderTaskEither"
import { task } from "fp-ts/lib/Task"
import {
  ChangeTurnInput,
  JoinGameInput,
  JoinTeamInput,
  RevealWordInput,
  SendHintInput,
  SetSpyMasterInput,
  StartGameInput,
} from "../domain/models"
import { GameMessageType, RegisterUserSocketInput } from "../messaging/messages"
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
  type: GameMessageType,
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

export const registerUserHandler: SocketHandler<RegisterUserSocketInput> = socket => ({ userId }) =>
  withEnv(({ gameMessagingPorts, gameMessagingEnvironment }) =>
    pipe(adapt(gameMessagingPorts.registerUser({ userId, socketId: socket.id }), gameMessagingEnvironment)),
  )

export const disconnectHandler: SocketHandler = socket => () => {
  console.log("DISCONNECT=====>\n", socket.id)
  return withEnv(({ gameMessagingPorts, gameMessagingEnvironment }) =>
    pipe(adapt(gameMessagingPorts.unregisterSocket({ socketId: socket.id }), gameMessagingEnvironment)),
  )
}
export const createGameHandler: SocketHandler<CreateGameInput> = socket => ({ gameId, userId, language }) =>
  withEnv(({ gamesDomainPorts, domainEnvironment, uuid }) => {
    const newGameId = gameId || uuid()
    socket.join(newGameId, async (_: any) => {
      await gamesDomainPorts.create({ gameId: newGameId, userId, language })(domainEnvironment)()
    })
    return actionOf(undefined)
  })

export const joinGameHandler: SocketHandler<JoinGameInput> = socket => input => {
  return withEnv(({ gamesDomainPorts, domainEnvironment }) => {
    socket.join(input.gameId, async (_: any) => {
      await gamesDomainPorts.join(input)(domainEnvironment)()
    })
    return actionOf(undefined)
  })
}

export const joinTeamHandler: SocketHandler<JoinTeamInput> = _ => input =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) =>
    pipe(
      adapt(gamesDomainPorts.joinTeam(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const setSpyMasterHandler: SocketHandler<SetSpyMasterInput> = _ => input =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) =>
    pipe(
      adapt(gamesDomainPorts.setSpyMaster(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const startGameHandler: SocketHandler<StartGameInput> = _ => input =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) =>
    pipe(
      adapt(gamesDomainPorts.startGame(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const sendHintHandler: SocketHandler<SendHintInput> = _ => input =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) =>
    pipe(
      adapt(gamesDomainPorts.sendHint(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const revealWordHandler: SocketHandler<RevealWordInput> = _ => input =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) =>
    pipe(
      adapt(gamesDomainPorts.revealWord(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const changeTurnHandler: SocketHandler<ChangeTurnInput> = _ => input =>
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
  addMessageHandler(env)(socket, "joinTeam", joinTeamHandler)
  addMessageHandler(env)(socket, "setSpyMaster", setSpyMasterHandler)
  addMessageHandler(env)(socket, "startGame", startGameHandler)
  addMessageHandler(env)(socket, "sendHint", sendHintHandler)
  addMessageHandler(env)(socket, "revealWord", revealWordHandler)
  addMessageHandler(env)(socket, "changeTurn", changeTurnHandler)
}
