import { actionOf, withEnv } from "../utils/actions"
import { GameMessagingPort } from "./adapters"
import * as Messages from "codenames50-messaging/lib/messages"

export interface UserSocketLink {
  socketId: string
  userId: string
  gameId?: string
}

let userSocketLinks: UserSocketLink[] = []

export type RegisterUserInput = {
  userId: string
  socketId: string
}

export type UnregisterSocketInput = {
  socketId: string
}

export type AddGameToUserInput = {
  socketId: string
  userId: string
  gameId: string
}

type EmitMessageInput = {
  roomId: string
  userId: string
  message: Messages.GameMessage
}

type BrodcastMessageInput = {
  roomId: string
  message: Messages.GameMessage
}

export const registerUser: GameMessagingPort<RegisterUserInput> = input => {
  userSocketLinks = [...userSocketLinks.filter(u => u.socketId !== input.socketId), input]
  return actionOf(undefined)
}

export const unregisterSocket: GameMessagingPort<UnregisterSocketInput, UserSocketLink[]> = ({ socketId }) => {
  const userLink = userSocketLinks.find(u => u.socketId === socketId)
  const userGames = userLink
    ? userSocketLinks.filter(u => u.userId === userLink.userId && u.gameId === userLink.gameId)
    : []
  userSocketLinks = userSocketLinks.filter(u => u.socketId !== socketId)
  return actionOf(userGames)
}

export const addGameToUser: GameMessagingPort<AddGameToUserInput> = ({ socketId, gameId }) => {
  const userLink = userSocketLinks.find(u => u.socketId === socketId)
  if (userLink) {
    userSocketLinks = [...userSocketLinks.filter(u => u.socketId !== socketId), { ...userLink, gameId }]
  }
  return actionOf(undefined)
}

export const emitMessage: GameMessagingPort<EmitMessageInput> = ({ userId, roomId, message }) =>
  withEnv(({ adapters: { messengerPorts, messengerEnvironment } }) => {
    const socketIds = messengerPorts.getSocketIdsForRoomId(messengerEnvironment)(roomId)
    const userLinks = userSocketLinks.filter(u => u.userId === userId && socketIds.includes(u.socketId))

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
  addGameToUser,
  broadcastMessage,
}

export type GameMessagingPorts = typeof gameMessagingPorts
