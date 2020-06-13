import { Port } from "../utils/adapters"
import { MessengerEnvironment, MessengerPorts } from "./messenger"

export type GameMessagingEnvironment = {
  adapters: {
    messengerPorts: MessengerPorts
    messengerEnvironment: MessengerEnvironment
  }
}

export type GameMessagingPort<I = void, R = void> = Port<GameMessagingEnvironment, I, R>

export const buildGameMessagingEnvironment = (
  messengerEnvironment: MessengerEnvironment,
  messengerPorts: MessengerPorts,
): GameMessagingEnvironment => ({
  adapters: {
    messengerPorts,
    messengerEnvironment,
  },
})
