import { actionOf, withEnv } from "../utils/actions"
import { GameMessagingPort } from "./adapters"
import { GameMessage } from "./messages"

interface UserSocketLink {
  userId: string
  socketId: string
}

let userSocketLinks: UserSocketLink[] = []

export type RegisterUserInput = {
  userId: string
  socketId: string
}

export type UnregisterSocket = {
  socketId: string
}

type EmitMessageInput = {
  roomId: string
  userId: string
  message: GameMessage
}

type BrodcastMessageInput = {
  roomId: string
  message: GameMessage
}

export const registerUser: GameMessagingPort<RegisterUserInput> = input => {
  userSocketLinks = [...userSocketLinks, input]
  return actionOf(undefined)
}

export const unregisterSocket: GameMessagingPort<UnregisterSocket> = ({ socketId }) => {
  userSocketLinks = userSocketLinks.filter(u => u.socketId !== socketId)
  return actionOf(undefined)
}

export const emitMessage: GameMessagingPort<EmitMessageInput> = ({ userId, roomId, message }) =>
  withEnv(({ adapters: { messengerPorts, messengerEnvironment } }) => {
    const socketIds = messengerPorts
      .getSocketIdsForRoomId(messengerEnvironment)(roomId)
      .map(s => s.socketId)
    const userLink = userSocketLinks.filter(u => u.userId === userId && socketIds.includes(u.socketId))
    if (userLink.length > 0) {
      messengerPorts.emit(messengerEnvironment)(userLink[0].socketId, message)
    }
    return actionOf(undefined)
  })

export const broadcastMessage: GameMessagingPort<BrodcastMessageInput> = ({ roomId, message }) =>
  withEnv(({ adapters: { messengerPorts, messengerEnvironment } }) => {
    messengerPorts.broadcast(messengerEnvironment)(roomId, message)
    return actionOf(undefined)
  })

export const gameMessagingPorts = {
  emitMessage,
  registerUser,
  unregisterSocket,
  broadcastMessage,
}

export type GameMessagingPorts = typeof gameMessagingPorts
