import { Port } from "../utils/adapters"
import { MessengerEnvironment, messengerPorts, MessengerPorts } from "./messenger"

export type GameMessagingEnvironment = {
  adapters: {
    messengerPorts: MessengerPorts
    messengerEnvironment: MessengerEnvironment
  }
}

export type GameMessagingPort<I = void, R = void> = Port<GameMessagingEnvironment, I, R>

export const buildGameMessagingEnvironment = (
  messengerEnvironment: MessengerEnvironment,
): GameMessagingEnvironment => ({
  adapters: {
    messengerPorts,
    messengerEnvironment,
  },
})
