import { actionOf, withEnv } from "../utils/actions"
import { GameMessagingPort } from "./adapters"
import { GameMessage } from "./messages"

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
  message: GameMessage
}

type BrodcastMessageInput = {
  roomId: string
  message: GameMessage
}

export const registerUser: GameMessagingPort<RegisterUserInput> = input => {
  userSocketLinks = [...userSocketLinks.filter(u => u.socketId !== input.socketId), input]
  console.log("registerUser=====>\n", userSocketLinks)
  return actionOf(undefined)
}

export const unregisterSocket: GameMessagingPort<UnregisterSocketInput, UserSocketLink[]> = ({ socketId }) => {
  console.log("unregisterSocket socketId=====>\n", socketId)
  const userLink = userSocketLinks.find(u => u.socketId === socketId)
  const userGames = userLink
    ? userSocketLinks.filter(u => u.userId === userLink.userId && u.gameId === userLink.gameId)
    : []
  userSocketLinks = userSocketLinks.filter(u => u.socketId !== socketId)
  console.log("unregisterSocket=====>\n", userGames)
  return actionOf(userGames)
}

export const addGameToUser: GameMessagingPort<AddGameToUserInput> = ({ socketId, gameId }) => {
  const userLink = userSocketLinks.find(u => u.socketId === socketId)
  console.log("addGameToUser1=====>\n", userLink)
  if (userLink) {
    userSocketLinks = [...userSocketLinks.filter(u => u.socketId !== socketId), { ...userLink, gameId }]
  }
  console.log("addGameToUser2=====>\n", userSocketLinks)
  return actionOf(undefined)
}

export const emitMessage: GameMessagingPort<EmitMessageInput> = ({ userId, roomId, message }) =>
  withEnv(({ adapters: { messengerPorts, messengerEnvironment } }) => {
    const socketIds = messengerPorts.getSocketIdsForRoomId(messengerEnvironment)(roomId)
    const userLinks = userSocketLinks.filter(u => u.userId === userId && socketIds.includes(u.socketId))

    console.log("emitMessage userLinks=====>\n", userLinks)
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
