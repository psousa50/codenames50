import { actionOf, withEnv } from "../utils/actions"
import { GameMessagingPort } from "./adapters"
import { Messages } from "@codenames50/messaging"

export interface UserSocketLink {
  socketId: string
  userId: string
  gameId?: string
}

let userSocketLinks: UserSocketLink[] = []

export type RegisterUserInput = {
  userId: string
  socketId: string
  gameId: string
}

export type UnregisterSocketInput = {
  socketId: string
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

export type ChatMessageInput = {
  gameId: string
  fromUserId: string
  message: string
  toUserId?: string // Optional, for direct messages
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

export const emitMessage: GameMessagingPort<EmitMessageInput> = ({ userId, roomId, message }) =>
  withEnv(({ adapters: { messengerPorts, messengerEnvironment } }) => {
    const socketIds = messengerPorts.getSocketIdsForRoomId(messengerEnvironment)(roomId)
    const userLinks = userSocketLinks.filter(u => u.userId === userId && socketIds.includes(u.socketId))

    console.log("emitMessage", userLinks)

    userLinks.forEach(ul => messengerPorts.emit(messengerEnvironment)(ul.socketId, message))

    return actionOf(undefined)
  })

export const broadcastMessage: GameMessagingPort<BrodcastMessageInput> = ({ roomId, message }) =>
  withEnv(({ adapters: { messengerPorts, messengerEnvironment } }) => {
    const socketIds = messengerPorts.getSocketIdsForRoomId(messengerEnvironment)(roomId)
    console.log("broadcast", socketIds)
    messengerPorts.broadcast(messengerEnvironment)(roomId, message)
    return actionOf(undefined)
  })

export const handleChatMessage: GameMessagingPort<ChatMessageInput> = ({ gameId, fromUserId, message, toUserId }) =>
  withEnv(() => {
    const chatMessage = Messages.chatMessage({ gameId, fromUserId, message, toUserId })
    if (toUserId) {
      // Send to a specific user
      emitMessage({ userId: toUserId, roomId: gameId, message: chatMessage })
    } else {
      // Broadcast to all users in the game
      broadcastMessage({ roomId: gameId, message: chatMessage })
    }
    return actionOf(undefined)
  })

export const gameMessagingPorts = {
  emitMessage,
  registerUser,
  unregisterSocket,
  broadcastMessage,
  handleChatMessage,
}

export type GameMessagingPorts = typeof gameMessagingPorts
