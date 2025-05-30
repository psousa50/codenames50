import { Messages } from "@codenames50/messaging"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, map, run } from "fp-ts/lib/ReaderTaskEither"
import { DomainPort } from "../domain/adapters"
import { UserSocketLink } from "../messaging/main"
import { actionOf, withEnv } from "../utils/actions"
import { adaptDomainToSocket, adaptMessagingToSocket } from "../utils/adapters"
import { SocketsEnvironment, SocketsPort } from "./adapters"

type SocketHandler<T = void> = (socket: SocketIO.Socket) => SocketsPort<T, void>

const removeUserFromGame: SocketsPort<UserSocketLink[]> = userLinks =>
  withEnv((env) =>
    pipe(
      userLinks.length === 1 && userLinks[0].gameId
        ? pipe(
            adaptDomainToSocket(
              env.gamesDomainPorts.removePlayer({ gameId: userLinks[0].gameId, userId: userLinks[0].userId }),
              env,
            ),
            map(_ => undefined),
          )
        : actionOf(undefined),
      map(_ => undefined),
    ),
  )

const disconnectHandler: SocketHandler = socket => () =>
  withEnv((env) =>
    pipe(
      adaptMessagingToSocket(env.gameMessagingPorts.unregisterSocket({ socketId: socket.id }), env),
      chain(removeUserFromGame),
      map(_ => undefined),
    ),
  )

const createGameHandler: SocketHandler<Messages.CreateGameInput> = socket => ({ userId }) =>
  withEnv((env) => {
    const gameId = env.uuid()
    socket.join(gameId, async (_: unknown) => {
      const h = pipe(
        adaptMessagingToSocket(env.gameMessagingPorts.registerUser({ socketId: socket.id, gameId, userId }), env),
        chain(_ => adaptDomainToSocket(env.gamesDomainPorts.create({ gameId, userId }), env)),
      )
      await run(h, env)
    })
    return actionOf(undefined)
  })

const joinGameHandler: SocketHandler<Messages.JoinGameInput> = socket => ({ gameId, userId }) =>
  withEnv((env) => {
    socket.join(gameId, async () => {
      const h = pipe(
        adaptMessagingToSocket(env.gameMessagingPorts.registerUser({ socketId: socket.id, gameId, userId }), env),
        chain(_ => adaptDomainToSocket(env.gamesDomainPorts.join({ gameId, userId }), env)),
      )
      await run(h, env)
    })
    return actionOf(undefined)
  })

const updateConfigHandler: SocketHandler<Messages.UpdateConfigInput> = _ => input =>
  withEnv((env) =>
    adaptMessagingToSocket(
      env.gameMessagingPorts.broadcastMessage({ roomId: input.gameId, message: Messages.updateConfig(input) }),
      env,
    ),
  )

const onDomainPort = <I, O>(domainPort: DomainPort<I, O>): SocketHandler<I> => _ => (input: I) =>
  withEnv((env) =>
    pipe(
      adaptDomainToSocket(domainPort(input), env),
      map(_ => undefined),
    ),
  )

const buildHandler = (socketsEnvironment: SocketsEnvironment, socket: SocketIO.Socket) => <I>(
  socketHandler: SocketHandler<I>,
) => async (input: I) => {
  try {
    await run(socketHandler(socket)(input), socketsEnvironment)
  } catch (ex) {
    console.log(`Socket handler exception: ${ex}`)
  }
}

const addMessageHandler = (socket: SocketIO.Socket) => (handler: Messages.GameMessageHandler) => {
  socket.on(handler.type, data => {
    console.log("RECEIVED:", handler.type)
    handler.handler(data)
  })
}

export const socketHandler = (env: SocketsEnvironment) => (socket: SocketIO.Socket) => {
  const add = addMessageHandler(socket)
  const handler = buildHandler(env, socket)

  add(Messages.createGameMessagehandler("changeTurn", handler(onDomainPort(env.gamesDomainPorts.changeTurn))))
  add(
    Messages.createGameMessagehandler("checkTurnTimeout", handler(onDomainPort(env.gamesDomainPorts.checkTurnTimeout))),
  )
  add(Messages.createGameMessagehandler("createGame", handler(createGameHandler)))
  add(Messages.createGameMessagehandler("disconnect", handler(disconnectHandler)))
  add(Messages.createGameMessagehandler("interceptWord", handler(onDomainPort(env.gamesDomainPorts.interceptWord))))
  add(Messages.createGameMessagehandler("joinGame", handler(joinGameHandler)))
  add(Messages.createGameMessagehandler("joinTeam", handler(onDomainPort(env.gamesDomainPorts.joinTeam))))
  add(Messages.createGameMessagehandler("randomizeTeam", handler(onDomainPort(env.gamesDomainPorts.randomizeTeams))))
  add(Messages.createGameMessagehandler("removePlayer", handler(onDomainPort(env.gamesDomainPorts.removePlayer))))
  add(Messages.createGameMessagehandler("restartGame", handler(onDomainPort(env.gamesDomainPorts.restartGame))))
  add(Messages.createGameMessagehandler("revealWord", handler(onDomainPort(env.gamesDomainPorts.revealWord))))
  add(Messages.createGameMessagehandler("sendHint", handler(onDomainPort(env.gamesDomainPorts.sendHint))))
  add(Messages.createGameMessagehandler("setSpyMaster", handler(onDomainPort(env.gamesDomainPorts.setSpyMaster))))
  add(Messages.createGameMessagehandler("startGame", handler(onDomainPort(env.gamesDomainPorts.startGame))))
  add(Messages.createGameMessagehandler("updateConfig", handler(updateConfigHandler)))
}
