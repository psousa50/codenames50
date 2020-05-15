import { actionOf, withEnv } from "../utils/actions"
import { GameMessagingPort } from "./adapters"
import { GameMessage } from "./models"

interface UserSocketLink {
  userId: string
  roomId: string
  socketId: string
}

let userSocketLinks: UserSocketLink[] = []

type RegisterInput = {
  userId: string
  roomId: string
  socketId: string
}

type SendMessageInput = {
  userId: string
  roomId: string
  message: GameMessage
}

type BrodcastMessageInput = {
  roomId: string
  message: GameMessage
}

export const register: GameMessagingPort<RegisterInput> = input => {
  userSocketLinks = [...userSocketLinks, input]
  return actionOf(undefined)
}

export const unregister: GameMessagingPort<RegisterInput> = ({ userId, roomId, socketId }) => {
  userSocketLinks = userSocketLinks.filter(u => u.roomId !== roomId || u.socketId !== socketId || u.userId !== userId)
  return actionOf(undefined)
}

export const emitMessage: GameMessagingPort<SendMessageInput> = ({ userId, roomId, message }) =>
  withEnv(env => {
    const userLink = userSocketLinks.find(u => u.userId === userId && u.roomId === roomId)
    if (userLink) {
      env.adapters.messenger.emit(userLink.socketId, message)
    }
    return actionOf(undefined)
  })

export const broadcastMessage: GameMessagingPort<BrodcastMessageInput> = ({ roomId, message }) =>
  withEnv(env => {
    env.adapters.messenger.broadcast(roomId, message)
    return actionOf(undefined)
  })

export const gameMessagingPorts = {
  emitMessage,
  register,
  unregister,
  broadcastMessage,
}
