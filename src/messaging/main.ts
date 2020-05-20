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
  console.log("registerUser=====>\n", userSocketLinks)
  return actionOf(undefined)
}

export const unregisterSocket: GameMessagingPort<UnregisterSocket> = ({ socketId }) => {
  userSocketLinks = userSocketLinks.filter(u => u.socketId !== socketId)
  console.log("unregisterSocket=====>\n", userSocketLinks)
  return actionOf(undefined)
}

export const emitMessage: GameMessagingPort<EmitMessageInput> = ({ userId, roomId, message }) =>
  withEnv(({ adapters: { messengerPorts, messengerEnvironment } }) => {
    const socketIds = messengerPorts.getSocketIdsForRoomId(messengerEnvironment)(roomId)
    const userLinks = userSocketLinks.filter(u => u.userId === userId && socketIds.includes(u.socketId))

    console.log("userLinks=====>\n", userLinks)
    userLinks.forEach(ul => messengerPorts.emit(messengerEnvironment)(ul.socketId, message))

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
